const express = require('express');
const router = express.Router();
const { registerUser, verifyOTP, sendSignupOtp, verifySignupOtp, completeProfile, sendPhoneOtp, verifyPhoneOtp, loginUser, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/send-signup-otp', sendSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.post('/complete-profile', completeProfile);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
