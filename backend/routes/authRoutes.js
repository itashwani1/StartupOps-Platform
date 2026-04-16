const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, getUserById } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.get('/user/:id', protect, getUserById);

module.exports = router;
