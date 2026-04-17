const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const {
    grantInvestorAccess,
    grantMentorAccess,
    revokeAccess,
    getInterests,
    respondToInterest
} = require('../controllers/accessController');

// All routes require authentication and Founder role
router.use(protect);
router.use(checkRole(['Founder']));

router.post('/grant-investor', grantInvestorAccess);
router.post('/grant-mentor', grantMentorAccess);
router.delete('/revoke/:accessId/:type', revokeAccess);
router.get('/interests/:startupId', getInterests);
router.put('/interest/:interestId', respondToInterest);

module.exports = router;
