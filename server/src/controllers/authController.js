const prisma = require('../lib/prisma');
const jwt    = require('jsonwebtoken');
const logActivity = require('../utils/logActivity');
const { uploadToCloudinary } = require('../middleware/upload');

const JWT_SECRET  = process.env.JWT_SECRET || 'rentease_dev_secret_key_32chars!!';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Standard email/password registration
// ─────────────────────────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    
    if (!['OWNER', 'TENANT'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        status: 'ACTIVE',
      }
    });

    await logActivity({ userId: user.id, action: 'REGISTER', entity: 'User', entityId: user.id });
    
    const token = signToken(user);
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return res.status(201).json({ token, user: userWithoutPassword, isNew: true });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Standard email/password login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    
    if (user.status === 'BLOCKED')
      return res.status(403).json({ error: 'This account has been suspended.' });

    // Users registered via Google OAuth might not have a password
    if (!user.password) {
      return res.status(401).json({ error: 'Please sign in with Google or reset your password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    await logActivity({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });
    
    const token = signToken(user);
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return res.json({ token, user: userWithoutPassword, isNew: false });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/google
// Real Firebase token flow — only works when Firebase env vars are set.
// Falls back gracefully if Firebase Admin SDK is not initialized.
// ─────────────────────────────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    // Try to verify with Firebase Admin
    const admin = require('../lib/firebase');
    if (!admin.apps || !admin.apps.length) {
      return res.status(503).json({
        error: 'Firebase is not configured on this server. Use Demo Login instead.',
        code: 'FIREBASE_NOT_CONFIGURED',
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decoded;

    let user = await prisma.user.findUnique({ where: { email } });
    const isNew = !user;

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || email.split('@')[0], avatar: picture, role: role || 'TENANT' }
      });
    }

    if (user.status === 'BLOCKED')
      return res.status(403).json({ error: 'Your account has been suspended.' });

    await logActivity({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });
    return res.json({ token: signToken(user), user, isNew });
  } catch (err) {
    console.error('googleLogin error:', err.message);
    return res.status(401).json({ error: 'Firebase token verification failed', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/google-supabase
// Verifies a Supabase access token (from Google OAuth) and creates/finds user.
// Body: { accessToken, role? }
// ─────────────────────────────────────────────────────────────────────────────
const googleSupabaseLogin = async (req, res) => {
  try {
    const { accessToken, role } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'accessToken is required' });

    const supabaseAdmin = require('../lib/supabaseAdmin');
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'Supabase is not configured on this server.',
        code: 'SUPABASE_NOT_CONFIGURED',
      });
    }

    // Verify token with Supabase Admin SDK
    const { data: { user: supaUser }, error: supaError } = await supabaseAdmin.auth.getUser(accessToken);
    if (supaError || !supaUser) {
      return res.status(401).json({ error: 'Invalid Supabase access token' });
    }

    const { email, user_metadata } = supaUser;
    const name   = user_metadata?.full_name || user_metadata?.name || email.split('@')[0];
    const avatar = user_metadata?.avatar_url || user_metadata?.picture || null;

    // Find or create user in our DB
    let user = await prisma.user.findUnique({ where: { email } });
    const isNew = !user;

    if (!user) {
      const validRole = ['OWNER', 'TENANT'].includes(role) ? role : 'TENANT';
      user = await prisma.user.create({
        data: { email, name, avatar, role: validRole, status: 'ACTIVE' }
      });
    }

    if (user.status === 'BLOCKED')
      return res.status(403).json({ error: 'Your account has been suspended.' });

    await logActivity({
      userId: user.id, action: isNew ? 'REGISTER' : 'LOGIN',
      entity: 'User', entityId: user.id, metadata: { provider: 'google' }
    });

    const token = signToken(user);
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return res.json({ token, user: userWithoutPassword, isNew });
  } catch (err) {
    console.error('googleSupabaseLogin error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/select-role  (requires auth middleware)
// ─────────────────────────────────────────────────────────────────────────────
const selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['OWNER', 'TENANT'].includes(role))
      return res.status(400).json({ error: 'Invalid role. Choose OWNER or TENANT.' });

    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { role } });
    await logActivity({ userId: updated.id, action: 'ROLE_SELECTED', entity: 'User', entityId: updated.id, metadata: { role } });
    return res.json({ token: signToken(updated), user: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
};

// GET /api/auth/demo-accounts  — returns list of demo emails for login picker
const demoAccounts = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { email: { endsWith: '@rentease.in' } },
    select: { id: true, name: true, email: true, role: true, avatar: true },
    orderBy: { role: 'asc' },
  });
  return res.json({ accounts: users });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  await logActivity({ userId: req.user.id, action: 'LOGOUT', entity: 'User', entityId: req.user.id });
  res.json({ message: 'Logged out' });
};

// PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { phone, occupation, company, about } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone, occupation, company, about },
    });
    
    await logActivity({ userId: user.id, action: 'PROFILE_UPDATED', entity: 'User', entityId: user.id });
    
    // Don't send password back
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    
    const avatarUrl = await uploadToCloudinary(req.file.path);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
    });
    
    await logActivity({ userId: user.id, action: 'AVATAR_UPDATED', entity: 'User', entityId: user.id });
    
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { googleLogin, googleSupabaseLogin, login, register, selectRole, getMe, demoAccounts, logout, updateProfile, updateAvatar };
