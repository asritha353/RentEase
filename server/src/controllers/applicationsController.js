const prisma = require('../lib/prisma');
const logActivity        = require('../utils/logActivity');
const createNotification = require('../utils/createNotification');

// ── POST /api/applications ────────────────────────────────────────────────────
const applyToProperty = async (req, res) => {
  try {
    const {
      propertyId, coverMessage, tenantPhone, tenantOccupation,
      tenantIncome, currentResidence, moveInDate, occupantCount,
      hasPets, specialRequirements
    } = req.body;

    if (!propertyId)     return res.status(400).json({ error: 'propertyId is required' });
    if (!tenantPhone)    return res.status(400).json({ error: 'Phone number is required' });
    if (!coverMessage)   return res.status(400).json({ error: 'Cover message is required' });
    if (!moveInDate)     return res.status(400).json({ error: 'Move-in date is required' });
    if (!tenantOccupation) return res.status(400).json({ error: 'Occupation is required' });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: { select: { id: true, name: true } } }
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.status === 'RENTED' || property.status === 'INACTIVE')
      return res.status(400).json({ error: 'Property is not available for applications' });

    // Duplicate check
    const existing = await prisma.application.findFirst({
      where: { tenantId: req.user.id, propertyId, status: { notIn: ['WITHDRAWN', 'REJECTED'] } }
    });
    if (existing) return res.status(409).json({
      error: 'You have already applied to this property',
      applicationId: existing.id
    });

    const application = await prisma.application.create({
      data: {
        tenantId: req.user.id,
        propertyId,
        coverMessage,
        tenantPhone,
        tenantOccupation,
        tenantIncome:   tenantIncome   ? parseInt(tenantIncome)   : null,
        currentResidence,
        moveInDate:     moveInDate     ? new Date(moveInDate)     : null,
        occupantCount:  occupantCount  ? parseInt(occupantCount)  : 1,
        hasPets:        hasPets === true || hasPets === 'true',
        specialRequirements: specialRequirements || null,
      },
      include: {
        property: { select: { title: true, city: true, rent: true, images: true } },
        tenant:   { select: { name: true, email: true, avatar: true } }
      }
    });

    // Notify owner immediately
    await createNotification({
      userId:  property.ownerId,
      type:    'NEW_APPLICATION',
      title:   'New Rental Application 🏠',
      message: `${req.user.name} has applied for "${property.title}"`,
      link:    '/owner/applications'
    });

    await logActivity({
      userId: req.user.id, action: 'APPLICATION_SUBMITTED',
      entity: 'Application', entityId: application.id,
      metadata: { propertyId, propertyTitle: property.title }
    });

    return res.status(201).json({ application });
  } catch (err) {
    console.error('applyToProperty error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/applications/mine (tenant) ───────────────────────────────────────
const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { tenantId: req.user.id },
      orderBy: { appliedAt: 'desc' },
      include: {
        property: {
          select: { id: true, title: true, city: true, area: true, rent: true, images: true }
        },
        agreement: { select: { id: true, pdfUrl: true, generatedAt: true } }
      }
    });
    return res.json({ applications });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/applications/received (owner) ────────────────────────────────────
const getReceivedApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where:   { property: { ownerId: req.user.id } },
      orderBy: { appliedAt: 'desc' },
      include: {
        property: { select: { id: true, title: true, city: true, area: true, rent: true, images: true } },
        tenant:   {
          select: { id: true, name: true, email: true, avatar: true }
        },
        agreement: { select: { id: true, pdfUrl: true, generatedAt: true } }
      }
    });
    return res.json({ applications });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/applications/:id/status (owner) ────────────────────────────────
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status))
      return res.status(400).json({ error: 'Status must be ACCEPTED or REJECTED' });

    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { property: true }
    });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (app.property.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });

    const updated = await prisma.application.update({
      where: { id: req.params.id }, data: { status }
    });

    await createNotification({
      userId:  app.tenantId,
      type:    'STATUS_CHANGED',
      title:   status === 'ACCEPTED' ? 'Application Accepted! 🎉' : 'Application Update',
      message: status === 'ACCEPTED'
        ? `Your application for "${app.property.title}" has been accepted! The owner will contact you shortly.`
        : `Your application for "${app.property.title}" was not selected this time.`,
      link: '/tenant/applications'
    });

    await logActivity({
      userId: req.user.id, action: `APPLICATION_${status}`,
      entity: 'Application', entityId: app.id,
      metadata: { propertyTitle: app.property.title }
    });
    return res.json({ application: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/applications/:id (tenant withdraw) ────────────────────────────
const withdrawApplication = async (req, res) => {
  try {
    const app = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!app)                    return res.status(404).json({ error: 'Application not found' });
    if (app.tenantId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (app.status !== 'PENDING')     return res.status(400).json({ error: 'Can only withdraw pending applications' });

    await prisma.application.update({ where: { id: req.params.id }, data: { status: 'WITHDRAWN' } });
    await logActivity({ userId: req.user.id, action: 'APPLICATION_WITHDRAWN', entity: 'Application', entityId: app.id });
    return res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── GET /api/applications/:id (detail view) ───────────────────────────────────
const getApplication = async (req, res) => {
  try {
    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        property: { include: { owner: { select: { id: true, name: true, email: true } } } },
        tenant:   { select: { id: true, name: true, email: true, avatar: true } },
        agreement: true
      }
    });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    // Only tenant or property owner can view
    if (app.tenantId !== req.user.id && app.property.ownerId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Not authorized' });
    return res.json({ application: app });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  applyToProperty, getMyApplications, getReceivedApplications,
  updateApplicationStatus, withdrawApplication, getApplication
};
