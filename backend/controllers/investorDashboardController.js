const Startup = require('../models/Startup');
const Task = require('../models/Task');
const InvestorAccess = require('../models/InvestorAccess');
const InvestorInterest = require('../models/InvestorInterest');
const Notification = require('../models/Notification');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get wallet data
// @route   GET /api/investor/wallet
// @access  Private (Investor only)
exports.getWalletData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
        
        // Calculate total invested (from Investment transactions)
        const totalInvestedRes = await Transaction.aggregate([
            { $match: { user: req.user._id, type: 'Investment', status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const totalInvested = totalInvestedRes.length > 0 ? totalInvestedRes[0].total : 0;

        // Fetch borrowing info
        const loans = await Loan.find({ investor: req.user._id, status: 'Active' });
        const totalOutstanding = loans.reduce((sum, l) => sum + (l.amount * (1 - (l.repaymentProgress || 0)/100)), 0);
        
        res.json({
            balance: user.walletBalance || 0,
            totalInvested,
            transactions: transactions || [],
            borrowing: {
                balance: 0,
                outstanding: totalOutstanding,
                nextPayment: loans.length > 0 ? 'Next Month' : 'N/A'
            }
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({ message: 'Server error fetching wallet data' });
    }
};

// @desc    Deposit funds
// @route   POST /api/investor/deposit
// @access  Private (Investor only)
exports.depositFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.user._id);
        user.walletBalance += parseFloat(amount);
        await user.save();

        const transaction = await Transaction.create({
            user: req.user._id,
            type: 'Deposit',
            amount: parseFloat(amount),
            description: 'Funds deposited to wallet',
            status: 'Completed'
        });

        await Notification.create({
            recipient: req.user._id,
            sender: req.user._id,
            message: `₹ ${amount.toLocaleString()} has been deposited into your wallet.`,
            type: 'Wallet Update',
            relatedId: transaction._id
        });

        res.json({ message: 'Deposit successful', balance: user.walletBalance, transaction });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ message: 'Server error during deposit' });
    }
};

// @desc    Withdraw funds
// @route   POST /api/investor/withdraw
// @access  Private (Investor only)
exports.withdrawFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.user._id);
        if (user.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        user.walletBalance -= parseFloat(amount);
        await user.save();

        const transaction = await Transaction.create({
            user: req.user._id,
            type: 'Withdrawal',
            amount: parseFloat(amount),
            description: 'Funds withdrawn from wallet',
            status: 'Completed'
        });

        await Notification.create({
            recipient: req.user._id,
            sender: req.user._id,
            message: `₹ ${amount.toLocaleString()} has been withdrawn from your wallet.`,
            type: 'Wallet Update',
            relatedId: transaction._id
        });

        res.json({ message: 'Withdrawal successful', balance: user.walletBalance, transaction });
    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ message: 'Server error during withdrawal' });
    }
};

// @desc    Get investor loans
// @route   GET /api/investor/loans
// @access  Private (Investor only)
exports.getInvestorLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ investor: req.user._id }).sort({ createdAt: -1 });
        
        // Calculate totals for dashboard
        const totalBorrowed = loans
            .filter(l => ['Active', 'Repaid', 'Approved'].includes(l.status))
            .reduce((sum, l) => sum + l.amount, 0);
            
        const totalOutstanding = loans
            .filter(l => l.status === 'Active')
            .reduce((sum, l) => sum + (l.amount * (1 - l.repaymentProgress/100)), 0);

        res.json({ 
            loans,
            stats: {
                totalBorrowed,
                totalOutstanding
            }
        });
    } catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({ message: 'Server error fetching loans' });
    }
};

// @desc    Request a new loan
// @route   POST /api/investor/loans
// @access  Private (Investor only)
exports.requestLoan = async (req, res) => {
    try {
        const { amount, type, purpose, tenure } = req.body;

        if (!amount || !type) {
            return res.status(400).json({ message: 'Amount and type are required' });
        }

        const loan = await Loan.create({
            investor: req.user._id,
            amount,
            type,
            purpose,
            tenure: tenure || 12
        });

        // Notify investor that request was received
        await Notification.create({
            recipient: req.user._id,
            sender: req.user._id, // Self notification for receipt
            message: `Your loan request for ₹ ${amount.toLocaleString()} has been received and is under review.`,
            type: 'Loan Request',
            relatedId: loan._id
        });

        res.status(201).json({
            message: 'Loan request submitted successfully',
            loan
        });
    } catch (error) {
        console.error('Request loan error:', error);
        res.status(500).json({ message: 'Server error submitting loan request' });
    }
};

// @desc    Invest in a startup
// @route   POST /api/investor/invest
// @access  Private (Investor only)
exports.investInStartup = async (req, res) => {
    try {
        const { startupId, shareUnits } = req.body;
        const units = parseInt(shareUnits);

        if (!units || units <= 0) {
            return res.status(400).json({ message: 'Invalid share units' });
        }

        const startup = await Startup.findById(startupId);
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        const totalCost = startup.valuation * units;
        const user = await User.findById(req.user._id);

        if (user.walletBalance < totalCost) {
            return res.status(400).json({ message: `Insufficient balance. Required: ₹ ${totalCost.toLocaleString()}` });
        }

        // Deduct from wallet
        user.walletBalance -= totalCost;
        await user.save();

        // Create transaction record
        const transaction = await Transaction.create({
            user: user._id,
            type: 'Investment',
            amount: totalCost,
            status: 'Completed',
            description: `Invested in ${units} units of ${startup.name}`
        });

        // Grant access if not already granted
        const existingAccess = await InvestorAccess.findOne({ investor: user._id, startup: startup._id });
        if (!existingAccess) {
            await InvestorAccess.create({
                investor: user._id,
                startup: startup._id,
                accessGrantedBy: startup.founder,
                grantedAt: new Date()
            });
        }

        // Notify founder
        await Notification.create({
            recipient: startup.founder,
            sender: user._id,
            message: `Investor ${user.name} has invested ₹ ${totalCost.toLocaleString()} in your startup ${startup.name}.`,
            type: 'Investment Received',
            relatedId: transaction._id
        });

        res.json({
            message: 'Investment successful!',
            balance: user.walletBalance,
            transaction
        });

    } catch (error) {
        console.error('Investment error:', error);
        res.status(500).json({ message: 'Server error during investment' });
    }
};

// @desc    Get public startups for opportunities
// @route   GET /api/investor/opportunities
// @access  Private (Investor only)
exports.getPublicStartups = async (req, res) => {
    try {
        // Find startups that are public and the investor doesn't have access to already
        const accessRecords = await InvestorAccess.find({ investor: req.user._id });
        const accessIds = accessRecords.map(a => a.startup);

        const startups = await Startup.find({
            visibility: 'Public',
            _id: { $nin: accessIds }
        })
            .select('name stage problem solution market progress founder investmentAmount valuation')
            .limit(10);

        // Also check for existing interest
        const interestRecords = await InvestorInterest.find({ investor: req.user._id });
        const interestIds = interestRecords.map(i => i.startup.toString());

        const formattedStartups = startups.map(s => ({
            id: s._id,
            name: s.name,
            stage: s.stage,
            problem: s.problem || '',
            solution: s.solution || '',
            market: s.market || 'Technology',
            progress: s.progress || 0,
            investmentAmount: s.investmentAmount || 0,
            valuation: s.valuation || 0,
            hasExpressedInterest: interestIds.includes(s._id.toString())
        }));

        res.json({ opportunities: formattedStartups || [] });

    } catch (error) {
        console.error('Get public startups error:', error);
        res.status(500).json({ message: 'Server error fetching opportunities' });
    }
};

// @desc    Express interest in a startup
// @route   POST /api/investor/interest
// @access  Private (Investor only)
exports.expressInterest = async (req, res) => {
    try {
        const { startupId, message } = req.body;

        const startup = await Startup.findById(startupId).populate('founder');
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Create interest record
        const interest = await InvestorInterest.create({
            investor: req.user._id,
            startup: startupId,
            message: message || ''
        });

        // Notify founder
        await Notification.create({
            recipient: startup.founder._id,
            sender: req.user._id,
            message: `Investor ${req.user.name} has expressed interest in your startup: ${startup.name}. Check details in your connections.`,
            type: 'Investor Interest',
            relatedId: interest._id
        });

        res.status(201).json({
            message: 'Interest expressed successfully',
            interest
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already expressed interest in this startup' });
        }
        console.error('Express interest error:', error);
        res.status(500).json({ message: 'Server error expressing interest' });
    }
};

// @desc    Get investor dashboard data
// @route   GET /api/investor/dashboard/:startupId
// @access  Private (Investor only)
exports.getInvestorDashboard = async (req, res) => {
    try {
        const startupId = req.params.startupId;

        // Verify access
        const access = await InvestorAccess.findOne({
            investor: req.user._id,
            startup: startupId
        });

        if (!access) {
            return res.status(403).json({ message: 'No access to this startup' });
        }

        // Fetch startup details
        const startup = await Startup.findById(startupId).select('-__v');

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Get task statistics
        const totalTasks = await Task.countDocuments({ startup: startupId });
        const completedTasks = await Task.countDocuments({
            startup: startupId,
            status: 'Done'
        });

        const taskCompletionRate = totalTasks > 0
            ? ((completedTasks / totalTasks) * 100).toFixed(1)
            : 0;

        // Get milestone data
        const milestones = await Task.find({
            startup: startupId,
            priority: 'High'
        })
            .select('title status dueDate assignedTo')
            .populate('assignedTo', 'name')
            .sort({ dueDate: 1 })
            .limit(10);

        // Calculate completion percentage by status
        const tasksByStatus = await Task.aggregate([
            { $match: { startup: startup._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusBreakdown = {
            todo: 0,
            inProgress: 0,
            done: 0
        };

        tasksByStatus.forEach(item => {
            if (item._id === 'Todo') statusBreakdown.todo = item.count;
            if (item._id === 'In Progress') statusBreakdown.inProgress = item.count;
            if (item._id === 'Done') statusBreakdown.done = item.count;
        });

        res.json({
            startup: {
                name: startup.name,
                problem: startup.problem || '',
                solution: startup.solution || '',
                stage: startup.stage,
                market: startup.market || 'Technology',
                progress: startup.progress || 0,
                investmentAmount: startup.investmentAmount || 0,
                valuation: startup.valuation || 0
            },
            analytics: {
                totalTasks: totalTasks || 0,
                completedTasks: completedTasks || 0,
                taskCompletionRate: taskCompletionRate || 0,
                statusBreakdown: statusBreakdown || { todo: 0, inProgress: 0, done: 0 }
            },
            milestones: (milestones || []).map(m => ({
                title: m.title,
                status: m.status,
                dueDate: m.dueDate,
                assignedTo: m.assignedTo?.name || 'Unassigned'
            }))
        });

    } catch (error) {
        console.error('Investor dashboard error:', error);
        res.status(500).json({ message: 'Server error fetching investor dashboard' });
    }
};

// @desc    Get list of startups investor has access to
// @route   GET /api/investor/startups
// @access  Private (Investor only)
exports.getInvestorStartups = async (req, res) => {
    try {
        const accessRecords = await InvestorAccess.find({ investor: req.user._id })
            .populate('startup', 'name stage progress investmentAmount valuation market')
            .sort({ grantedAt: -1 });

        const startups = accessRecords
            .filter(record => record.startup) // Ensure startup exists
            .map(record => ({
                id: record.startup._id,
                name: record.startup.name,
                stage: record.startup.stage,
                progress: record.startup.progress,
                investmentAmount: record.startup.investmentAmount || 0,
                valuation: record.startup.valuation || 0,
                market: record.startup.market || 'Technology',
                accessGrantedAt: record.grantedAt
            }));

        res.json({ startups: startups || [] });

    } catch (error) {
        console.error('Get investor startups error:', error);
        res.status(500).json({ message: 'Server error fetching startups' });
    }
};

// @desc    Submit investor feedback
// @route   POST /api/investor/feedback
// @access  Private (Investor only)
exports.submitInvestorFeedback = async (req, res) => {
    try {
        const { startupId, rating, comment } = req.body;

        // Verify access
        const access = await InvestorAccess.findOne({
            investor: req.user._id,
            startup: startupId
        });

        if (!access) {
            return res.status(403).json({ message: 'No access to this startup' });
        }

        const Feedback = require('../models/Feedback');

        const feedback = await Feedback.create({
            startup: startupId,
            user: req.user._id,
            rating,
            comment,
            status: 'New'
        });

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback
        });

    } catch (error) {
        console.error('Submit investor feedback error:', error);
        res.status(500).json({ message: 'Server error submitting feedback' });
    }
};
