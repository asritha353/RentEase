const prisma = require('../lib/prisma');

/**
 * Create an in-app notification for a user.
 */
const createNotification = async ({ userId, type, title, message, link = null }) => {
  try {
    await prisma.notification.create({ data: { userId, type, title, message, link } });
  } catch (err) {
    console.warn('createNotification failed silently:', err.message);
  }
};

module.exports = createNotification;
