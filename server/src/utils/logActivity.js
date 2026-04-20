const prisma = require('../lib/prisma');

/**
 * Log an activity event to the audit trail.
 * All fields are optional except `action`.
 */
const logActivity = async ({ userId = null, action, entity = null, entityId = null, metadata = null, ipAddress = null } = {}) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entity, entityId, metadata, ipAddress, timestamp: new Date() }
    });
  } catch (err) {
    // Never let logging failures crash the main request
    console.warn('logActivity failed silently:', err.message);
  }
};

module.exports = logActivity;
