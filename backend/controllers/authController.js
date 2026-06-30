const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/emailService');

// Generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, rollNumber, accessCode } = req.body;
    
    if (role === 'faculty') {
      const requiredCode = process.env.FACULTY_ACCESS_CODE || 'Sona_Fac_2618';
      if (accessCode !== requiredCode) {
        return res.status(400).json({ message: 'Invalid Faculty Access Code. Please contact administration.' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ 
      name, email, password, role, department, rollNumber, 
      isVerified: true
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Step 1 of new signup: send OTP to email before filling details
// @route   POST /api/auth/send-signup-otp
const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists. Please login.' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert a pending (unverified) record to hold the OTP with placeholders for required fields
    await User.findOneAndUpdate(
      { email },
      { 
        otp, 
        otpExpiry: expiry, 
        isVerified: false,
        name: 'Pending Verification',
        password: 'PendingPassword123!'
      },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    );

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:16px;">
        <h2 style="color:#a855f7;margin-bottom:8px;">Verify your Email</h2>
        <p style="color:#aaa;">Use the OTP below to verify your email and create your SonaConnect account.</p>
        <div style="background:#1a1a2e;border:1px solid #a855f7;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#fff;">${otp}</span>
        </div>
        <p style="color:#666;font-size:13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `;
    await sendEmail({ email, subject: 'Your SonaConnect Signup OTP', html });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Step 2: verify OTP for signup
// @route   POST /api/auth/verify-signup-otp
const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'No OTP request found for this email' });
    if (user.isVerified && user.name) return res.status(400).json({ message: 'Email already verified. Please login.' });
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used but don't fully verify yet — wait for profile completion
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'OTP verified. Please complete your profile.', emailVerified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Step 3: complete profile after email verification
// @route   POST /api/auth/complete-profile
const completeProfile = async (req, res) => {
  try {
    const { email, name, password, role, department, rollNumber, accessCode } = req.body;

    if (role === 'faculty') {
      const requiredCode = process.env.FACULTY_ACCESS_CODE || 'Sona_Fac_2618';
      if (accessCode !== requiredCode) {
        return res.status(400).json({ message: 'Invalid Faculty Access Code. Please contact administration.' });
      }
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Please complete email verification first.' });
    if (user.isVerified && user.name) return res.status(400).json({ message: 'Account already exists. Please login.' });

    user.name = name;
    user.password = password;
    user.role = role || 'student';
    user.department = department || '';
    user.rollNumber = rollNumber || '';
    user.isVerified = true;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP for registration (old flow kept for compatibility)
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        if (user.role !== 'super_admin') {
          return res.status(401).json({ message: 'Please verify your email first', requiresVerification: true });
        }
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        clubManaged: user.clubManaged,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp = generateOTP();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:16px;">
        <h2 style="color:#a855f7;margin-bottom:8px;">Password Reset Request</h2>
        <p style="color:#aaa;">Use the OTP below to reset your SonaConnect password.</p>
        <div style="background:#1a1a2e;border:1px solid #a855f7;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#fff;">${otp}</span>
        </div>
        <p style="color:#666;font-size:13px;">This OTP expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
      </div>
    `;
    await sendEmail({ email, subject: 'Password Reset - SonaConnect', html });

    res.json({ message: 'Reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetPasswordOtp !== otp || user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('clubManaged');
  res.json(user);
};

module.exports = { registerUser, verifyOTP, sendSignupOtp, verifySignupOtp, completeProfile, loginUser, forgotPassword, resetPassword, getMe };
