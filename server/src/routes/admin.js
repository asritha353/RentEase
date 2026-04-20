const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getStats, getUsers, updateUserStatus,
  getAdminProperties, deleteAdminProperty,
  getAdminApplications, getActivityLogs
} = require('../controllers/adminController');

const isAdmin = [verifyToken, requireRole('ADMIN')];

router.get('/stats',               ...isAdmin, getStats);
router.get('/users',               ...isAdmin, getUsers);
router.patch('/users/:id/status',  ...isAdmin, updateUserStatus);
router.get('/properties',          ...isAdmin, getAdminProperties);
router.delete('/properties/:id',   ...isAdmin, deleteAdminProperty);
router.get('/applications',        ...isAdmin, getAdminApplications);
router.get('/logs',                ...isAdmin, getActivityLogs);

module.exports = router;
