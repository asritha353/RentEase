const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

// All notifications routes require auth
router.use(verifyToken);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/read-all  (must be before /:id)
router.patch('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data:  { isRead: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
