const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Startup = require('./models/Startup');
const InvestorAccess = require('./models/InvestorAccess');
const Loan = require('./models/Loan');
const Transaction = require('./models/Transaction');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // 1. Find the investor (assume the first user with Investor role)
        const investor = await User.findOne({ role: 'Investor' });
        if (!investor) {
            console.error('No investor found. Please sign up an investor first.');
            process.exit(1);
        }
        console.log(`Seeding data for investor: ${investor.name} (${investor.email})`);

        // Clear existing dummy data to avoid duplicates
        await Startup.deleteMany({ name: { $in: ['EcoTech Solutions', 'HealthAI', 'FinFlow', 'SolarGrid', 'EduZoom'] } });
        await Loan.deleteMany({ investor: investor._id });
        await Transaction.deleteMany({ user: investor._id });
        await InvestorAccess.deleteMany({ investor: investor._id });
        console.log('Cleared existing dummy data.');

        // 2. Create some startups (if they don't exist)
        const founder = await User.findOne({ role: 'Founder' }) || investor; // Use anyone as founder if none found
        
        const dummyStartups = [
            { name: 'EcoTech Solutions', problem: 'Plastic waste in oceans', solution: 'Biodegradable packaging', stage: 'MVP', market: 'Sustainable Packaging', founder: founder._id, visibility: 'Public', progress: 65, investmentAmount: 500000, valuation: 125000 },
            { name: 'HealthAI', problem: 'Late cancer diagnosis', solution: 'AI-driven diagnostic tool', stage: 'Growth', market: 'HealthTech', founder: founder._id, visibility: 'Public', progress: 40, investmentAmount: 1200000, valuation: 300000 },
            { name: 'FinFlow', problem: 'Manual bookkeeping for SMEs', solution: 'Automated accounting app', stage: 'Idea', market: 'FinTech', founder: founder._id, visibility: 'Public', progress: 15, investmentAmount: 200000, valuation: 50000 },
            { name: 'SolarGrid', problem: 'Energy shortage in rural areas', solution: 'Micro-solar grids', stage: 'Growth', market: 'Clean Energy', founder: founder._id, visibility: 'Public', progress: 85, investmentAmount: 2500000, valuation: 625000 },
            { name: 'EduZoom', problem: 'Poor student engagement', solution: 'Gamified learning platform', stage: 'MVP', market: 'EdTech', founder: founder._id, visibility: 'Public', progress: 30, investmentAmount: 450000, valuation: 112500 }
        ];

        const createdStartups = await Startup.insertMany(dummyStartups);
        console.log(`Created ${createdStartups.length} startups.`);

        // 3. Give investor access to some startups (Investments)
        const accessRecords = createdStartups.slice(0, 2).map(s => ({
            investor: investor._id,
            startup: s._id,
            accessGrantedBy: founder._id,
            grantedAt: new Date()
        }));
        await InvestorAccess.insertMany(accessRecords);
        console.log(`Granted investor access to ${accessRecords.length} startups.`);

        // 4. Create some loans
        const dummyLoans = [
            { investor: investor._id, amount: 500000, type: 'Working Capital', status: 'Active', repaymentProgress: 45, purpose: 'Expansion into new markets' },
            { investor: investor._id, amount: 250000, type: 'Investment Capital', status: 'Pending', purpose: 'Angel investment in HealthAI' },
            { investor: investor._id, amount: 1000000, type: 'Purchase Order Financing', status: 'Repaid', repaymentProgress: 100, purpose: 'Inventory stock up' }
        ];
        await Loan.insertMany(dummyLoans);
        console.log(`Created ${dummyLoans.length} loans.`);

        // 5. Create some transactions
        const dummyTransactions = [
            { user: investor._id, type: 'Deposit', amount: 200000, status: 'Completed', description: 'Initial wallet load' },
            { user: investor._id, type: 'Investment', amount: 50000, status: 'Completed', description: 'Invested in EcoTech Solutions' },
            { user: investor._id, type: 'Withdrawal', amount: 10000, status: 'Completed', description: 'Monthly profit withdrawal' },
            { user: investor._id, type: 'Loan Disbursement', amount: 500000, status: 'Completed', description: 'Working capital loan received' }
        ];
        await Transaction.insertMany(dummyTransactions);
        console.log(`Created ${dummyTransactions.length} transactions.`);

        // 6. Update investor wallet balance
        investor.walletBalance = 640000; // 200k + 500k - 50k - 10k
        await investor.save();
        console.log('Updated investor wallet balance.');

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
