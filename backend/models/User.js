const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    memberId: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Founder', 'Team', 'Investor', 'Mentor'],
        default: 'Founder',
    },
    department: {
        type: String,
    },
    accessLevel: {
        type: String,
        default: 'Standard',
    },
    phoneNumber: {
        type: String,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    avatar: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active',
    },
    startup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Startup',
    },
    walletBalance: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
