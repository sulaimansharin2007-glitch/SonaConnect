require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SonaConnect API Running 🚀' }));

// Privacy Policy page (required for Meta App Live mode)
app.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Privacy Policy — SonaConnect</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f1a; color: #e2e2f0; padding: 40px 20px; line-height: 1.7; }
    .container { max-width: 760px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 4px; color: #fff; }
    .sub { color: #888; font-size: 0.9rem; margin-bottom: 40px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    h2 { font-size: 1.1rem; color: #fff; margin-bottom: 10px; }
    p { color: #b0b0cc; margin-bottom: 8px; }
    ul { color: #b0b0cc; padding-left: 20px; }
    ul li { margin-bottom: 6px; }
    a { color: #6c63ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .footer { text-align: center; color: #555; font-size: 0.85rem; margin-top: 40px; }
    .badge { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 30px; }
    .icon { width: 48px; height: 48px; background: rgba(108,99,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <div class="icon">🛡️</div>
      <div>
        <h1>Privacy Policy</h1>
        <p class="sub">Last updated: July 2025</p>
      </div>
    </div>

    <div class="card">
      <h2>1. About SonaConnect</h2>
      <p>SonaConnect is a college event management platform built for Sona College of Technology, Salem. It helps students, faculty, and club administrators discover, publish, and manage college events in one place.</p>
    </div>

    <div class="card">
      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Name</strong> — to personalize your account.</li>
        <li><strong>Email address</strong> — to authenticate your account and send notifications.</li>
        <li><strong>WhatsApp phone number</strong> — collected only for Faculty and Club Admin accounts to enable WhatsApp Bot event publishing.</li>
        <li><strong>Department and role</strong> — to show you relevant events and grant appropriate access.</li>
        <li><strong>Roll number</strong> — optionally provided by students for identification.</li>
      </ul>
    </div>

    <div class="card">
      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your SonaConnect account.</li>
        <li>To send WhatsApp OTP verification codes during Faculty/Admin registration.</li>
        <li>To authorize WhatsApp Bot event publishing for verified faculty and club admins.</li>
        <li>To display events, clubs, workshops, and hackathons relevant to your role.</li>
        <li>To send in-platform notifications about events you have registered for.</li>
      </ul>
    </div>

    <div class="card">
      <h2>4. WhatsApp Integration</h2>
      <p>SonaConnect uses the <strong>Meta WhatsApp Business API</strong> to send OTP verification messages to faculty and club admins during signup, and to receive event poster images from authorized faculty members via WhatsApp. Your WhatsApp phone number is stored securely and is only used for the purposes described above.</p>
    </div>

    <div class="card">
      <h2>5. Data Sharing</h2>
      <p>We do <strong>not</strong> sell, trade, or share your personal information with any third parties. Data is only used within the SonaConnect platform and the Meta WhatsApp API for the stated purposes.</p>
    </div>

    <div class="card">
      <h2>6. Data Security</h2>
      <p>All data is stored securely in a MongoDB database hosted on MongoDB Atlas. Passwords are encrypted using bcrypt. WhatsApp tokens and API keys are stored as environment variables and are never exposed publicly.</p>
    </div>

    <div class="card">
      <h2>7. Your Rights</h2>
      <p>You may request deletion of your account and associated data at any time by contacting us. Once deleted, your personal information will be permanently removed from our systems.</p>
    </div>

    <div class="card">
      <h2>8. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact the SonaConnect development team at Sona College of Technology, Salem, Tamil Nadu, India.</p>
      <p>Email: <a href="mailto:sonaconnect.web@gmail.com">sonaconnect.web@gmail.com</a></p>
    </div>

    <p class="footer">© ${new Date().getFullYear()} SonaConnect — Sona College of Technology</p>
  </div>
</body>
</html>`);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SonaConnect Server running on port ${PORT}`);
});

module.exports = app;
