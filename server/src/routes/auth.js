const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  googleLogin, googleSupabaseLogin, login, register,
  selectRole, getMe, demoAccounts, logout, updateProfile, updateAvatar
} = require('../controllers/authController');

// Public routes
router.post('/google',          googleLogin);           // Legacy Firebase
router.post('/google-supabase', googleSupabaseLogin);   // Supabase OAuth
router.post('/login',           login);
router.post('/register',        register);
router.get('/demo-accounts',    demoAccounts);

// Protected routes
router.post('/select-role',     verifyToken, selectRole);
router.get('/me',               verifyToken, getMe);
router.patch('/profile',        verifyToken, updateProfile);
router.post('/avatar',          verifyToken, upload.single('avatar'), updateAvatar);
router.post('/logout',          verifyToken, logout);

module.exports = router;
