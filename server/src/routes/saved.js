const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');

// All saved routes require TENANT
router.use(verifyToken, requireRole('TENANT'));

// GET /api/saved
router.get('/', async (req, res) => {
  try {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: req.user.id },
      include: { property: { include: { owner: { select: { id: true, name: true } } } } },
      orderBy: { savedAt: 'desc' },
    });
    res.json({ saved: saved.map(s => s.property) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/saved/:propertyId
router.post('/:propertyId', async (req, res) => {
  try {
    await prisma.savedProperty.upsert({
      where:  { userId_propertyId: { userId: req.user.id, propertyId: req.params.propertyId } },
      create: { userId: req.user.id, propertyId: req.params.propertyId },
      update: {},
    });
    res.json({ saved: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/saved/:propertyId
router.delete('/:propertyId', async (req, res) => {
  try {
    await prisma.savedProperty.deleteMany({
      where: { userId: req.user.id, propertyId: req.params.propertyId },
    });
    res.json({ saved: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
