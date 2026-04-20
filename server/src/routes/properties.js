const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getProperties, getMyProperties, getProperty,
  createProperty, updateProperty, deleteProperty, suggestRent
} = require('../controllers/propertiesController');

// ── Static routes MUST come before /:id ──────────────────────────────────────

// Owner: get their own listings
router.get('/mine',         verifyToken, requireRole('OWNER'), getMyProperties);

// AI rent suggestion
router.post('/suggest-rent', verifyToken, requireRole('OWNER'), suggestRent);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/',    getProperties);
router.get('/:id', getProperty);    // ← dynamic LAST

// ── Owner CRUD ────────────────────────────────────────────────────────────────
router.post('/',      verifyToken, requireRole('OWNER'), upload.array('images', 6), createProperty);
router.put('/:id',    verifyToken, requireRole('OWNER', 'ADMIN'), upload.array('images', 6), updateProperty);
router.delete('/:id', verifyToken, requireRole('OWNER', 'ADMIN'), deleteProperty);

module.exports = router;
