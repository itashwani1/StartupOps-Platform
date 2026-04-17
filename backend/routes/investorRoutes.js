const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const {
    getInvestorDashboard,
    getInvestorStartups,
    submitInvestorFeedback,
    getPublicStartups,
    expressInterest,
    getInvestorLoans,
    requestLoan,
    getWalletData,
    depositFunds,
    withdrawFunds,
    investInStartup
} = require('../controllers/investorDashboardController');

// All routes require authentication and Investor role
router.use(protect);
router.use(checkRole(['Investor']));

router.post('/invest', investInStartup);
router.get('/startups', getInvestorStartups);
router.get('/dashboard/:startupId', getInvestorDashboard);
router.post('/feedback', submitInvestorFeedback);
router.get('/opportunities', getPublicStartups);
router.post('/interest', expressInterest);
router.get('/loans', getInvestorLoans);
router.post('/loans', requestLoan);
router.get('/wallet', getWalletData);
router.post('/deposit', depositFunds);
router.post('/withdraw', withdrawFunds);

module.exports = router;
