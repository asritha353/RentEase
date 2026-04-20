const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { generateAgreement, getAgreementPdf, getMyAgreements, getOwnerAgreements } = require('../controllers/agreementsController');

router.get('/my',                           verifyToken, requireRole('TENANT'),         getMyAgreements);
router.get('/owner',                        verifyToken, requireRole('OWNER'),          getOwnerAgreements);
router.post('/generate/:applicationId',     verifyToken, requireRole('OWNER'),          generateAgreement);
router.get('/:id/pdf',                      verifyToken,                                getAgreementPdf);

module.exports = router;
