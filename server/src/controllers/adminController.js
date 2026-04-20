const prisma = require('../lib/prisma');
const logActivity = require('../utils/logActivity');

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [users, properties, applications, agreements, byRole, byPropStatus, byAppStatus] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.application.count(),
      prisma.agreement.count(),
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.property.groupBy({ by: ['status'], _count: true }),
      prisma.application.groupBy({ by: ['status'], _count: true }),
    ]);
    return res.json({ users, properties, applications, agreements, byRole, byPropStatus, byAppStatus });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role)   where.role = role;
    if (search) where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
        include: { _count: { select: { properties: true, applications: true } } }
      }),
      prisma.user.count({ where }),
    ]);
    return res.json({ users, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────
const updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['ACTIVE', 'BLOCKED'].includes(status))
      return res.status(400).json({ error: 'Status must be ACTIVE or BLOCKED' });

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'ADMIN') return res.status(400).json({ error: 'Cannot block an admin' });

    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { status } });
    await logActivity({
      userId: req.user.id, action: `USER_${status}`,
      entity: 'User', entityId: req.params.id,
      metadata: { reason }
    });
    return res.json({ user: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/properties ─────────────────────────────────────────────────
const getAdminProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        skip, take: parseInt(limit), orderBy: { listedAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { applications: true } }
        }
      }),
      prisma.property.count(),
    ]);
    return res.json({ properties, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/admin/properties/:id ──────────────────────────────────────────
const deleteAdminProperty = async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    await logActivity({ userId: req.user.id, action: 'PROPERTY_ADMIN_DELETED', entity: 'Property', entityId: req.params.id });
    return res.json({ message: 'Property deleted by admin' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/applications ───────────────────────────────────────────────
const getAdminApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        skip, take: parseInt(limit), orderBy: { appliedAt: 'desc' },
        include: {
          tenant:   { select: { id: true, name: true, email: true } },
          property: { include: { owner: { select: { id: true, name: true } } } }
        }
      }),
      prisma.application.count(),
    ]);
    return res.json({ applications, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/logs ───────────────────────────────────────────────────────
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip, take: parseInt(limit), orderBy: { timestamp: 'desc' },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
      }),
      prisma.activityLog.count(),
    ]);
    return res.json({ logs, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats, getUsers, updateUserStatus, getAdminProperties, deleteAdminProperty, getAdminApplications, getActivityLogs };
