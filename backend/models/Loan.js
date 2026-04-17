const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Working Capital', 'Invoice Financing', 'Purchase Order Financing', 'Investment Capital'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Active', 'Repaid', 'Rejected'],
        default: 'Pending'
    },
    disbursedDate: {
        type: Date
    },
    repaymentProgress: {
        type: Number,
        default: 0
    },
    interestRate: {
        type: Number,
        default: 12.5 // Example rate
    },
    tenure: {
        type: Number, // in months
        default: 12
    },
    purpose: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
