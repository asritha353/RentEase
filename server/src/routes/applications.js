const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  applyToProperty, getMyApplications, getReceivedApplications,
  updateApplicationStatus, withdrawApplication, getApplication
} = require('../controllers/applicationsController');

router.post('/',            verifyToken, requireRole('TENANT'), applyToProperty);
router.get('/mine',         verifyToken, requireRole('TENANT'), getMyApplications);
router.get('/received',     verifyToken, requireRole('OWNER'),  getReceivedApplications);
router.get('/:id',          verifyToken, getApplication);
router.patch('/:id/status', verifyToken, requireRole('OWNER'),  updateApplicationStatus);
router.delete('/:id',       verifyToken, requireRole('TENANT'), withdrawApplication);

module.exports = router;
