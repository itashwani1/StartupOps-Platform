const mongoose = require('mongoose');

const investorInterestSchema = new mongoose.Schema({
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Startup',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Connected', 'Declined'],
        default: 'Pending'
    },
    message: {
        type: String,
        default: ''
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure unique investor-startup interest
investorInterestSchema.index({ investor: 1, startup: 1 }, { unique: true });

const InvestorInterest = mongoose.model('InvestorInterest', investorInterestSchema);
module.exports = InvestorInterest;
