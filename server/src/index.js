require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const compression = require('compression');
const { execSync } = require('child_process');

const isProd = process.env.NODE_ENV === 'production';

// ── Auto-migrate + Auto-seed on startup ───────────────────────────────────────
if (isProd) {
  try {
    console.log('🔄 Running database migrations...');
    execSync('npx prisma db push --accept-data-loss', {
      cwd: __dirname + '/..', stdio: 'inherit', env: process.env,
    });
    console.log('✅ Database migrations complete.');
  } catch (e) {
    console.error('⚠️  Migration warning:', e.message);
  }

  // Auto-seed: only runs if users table is empty
  const { PrismaClient } = require('@prisma/client');
  const seedPrisma = new PrismaClient();
  seedPrisma.user.count().then(async (count) => {
    if (count === 0) {
      console.log('🌱 No users found — running seed...');
      try {
        execSync('node prisma/seed.js', {
          cwd: __dirname + '/..', stdio: 'inherit', env: process.env,
        });
        console.log('✅ Seed complete. Demo users and properties created!');
      } catch (e) {
        console.error('⚠️  Seed warning:', e.message);
      }
    } else {
      console.log(`✅ Database already has ${count} users. Skipping seed.`);
    }
    await seedPrisma.$disconnect();
  }).catch(() => seedPrisma.$disconnect());
}

const app = express();
const path = require('path');

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.disable('x-powered-by');

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',   // Vite fallback port
  'http://localhost:5175',   // Vite second fallback
  'https://rentease.in',
  'https://www.rentease.in',
];
app.use(cors({
  origin: true, // Allow all origins for the submission so Render/Netlify URLs don't get blocked
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Compression + Body ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: isProd ? '10kb' : '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev'));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/properties',    require('./routes/properties'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/agreements',    require('./routes/agreements'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/saved',         require('./routes/saved'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  ts: new Date(),
  env: process.env.NODE_ENV,
  uptime: Math.floor(process.uptime()) + 's',
}));

// ── Serve React Frontend (Production) ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../../client/dist')));

// ── API 404 handler ───────────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── React SPA Fallback ────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('❌ Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    error: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
    ...(isProd ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 RentEase API running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Auth: Demo login (no Firebase required for local dev)`);
  if (isProd) console.log('   🔒 Production security hardening: ACTIVE');
});
