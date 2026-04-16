const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, role, username } = req.body;
    console.log('Registration attempt:', { name, email, role, username });

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            console.log('User already exists:', email, username);
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            username,
        });

        if (user) {
            console.log('User created successfully:', email);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.log('User creation failed: Invalid user data');
            res.status(400).json({ message: 'Invalid user data provided' });
        }
    } catch (error) {
        console.error('Registration Error Details:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                startup: user.startup,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                startup: user.startup,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
