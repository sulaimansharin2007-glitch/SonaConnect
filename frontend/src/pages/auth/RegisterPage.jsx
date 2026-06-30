import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendSignupOtp, verifySignupOtp, completeProfile } from '../../api';
import { useAuth } from '../../context/AuthContext';

const departments = [
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Electrical and Electronics Engineering',
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Civil Engineering',
  'Fashion Technology',
  'Bio Medical Engineering',
  'Artificial Intelligence & Data Science',
  'Computer Science (Artificial Intelligence & Machine Learning)',
  'Computer Science and Design',
  'Electronics and Computer Engineering',
  'Electrical and Computer Engineering',
  'Computer Science and Engineering (PG)',
  'Power System Engineering',
  'Industrial Safety and Engineering',
  'Engineering Design',
  'VLSI Design',
  'Structural Engineering',
  'Construction Engineering & Management',
  'Information Technology (M.Tech)',
  'Master of Business Administration (MBA)',
  'Master of Computer Applications (MCA)'
];

const roleRedirects = {
  student: '/student/dashboard',
  club_admin: '/club/dashboard',
  faculty: '/faculty/dashboard',
  super_admin: '/admin/dashboard',
};

const stepTitles = ['Verify Email', 'Enter OTP', 'Create Account'];
const stepSubtitles = [
  'Enter your college email to get started',
  'Enter the 6-digit OTP sent to your email',
  'Fill in your details to complete registration',
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [form, setForm] = useState({ name: '', password: '', role: 'student', department: '', rollNumber: '', accessCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendSignupOtp({ email });
      toast.success('OTP sent to your email! 📧');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return toast.error('Please enter the complete 6-digit OTP');
    setLoading(true);
    try {
      await verifySignupOtp({ email, otp: otpValue });
      toast.success('Email verified! ✅ Now create your account.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete profile
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await completeProfile({ email, ...form });
      loginUser(data);
      toast.success(`Welcome to SonaConnect, ${data.name}! 🎉`);
      navigate(roleRedirects[data.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-dark bg-mesh flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-pink-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">SonaConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">{stepTitles[step - 1]}</h1>
          <p className="text-white/50 text-sm mt-1">{stepSubtitles[step - 1]}</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/30'
              }`}>{s}</div>
              {s < 3 && <div className={`w-8 h-0.5 transition-all duration-300 ${step > s ? 'bg-primary-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Email */}
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="email" placeholder="your@email.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10" required />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Send OTP</span><ArrowRight size={18} /></>}
                </motion.button>
              </motion.form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="text-sm text-white/60 mb-3 block text-center">OTP sent to <span className="text-primary-400">{email}</span></label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:bg-primary-500/10 transition-all outline-none"
                      />
                    ))}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Verify OTP</span><ArrowRight size={18} /></>}
                </motion.button>
                <button type="button" onClick={() => { setOtp(['','','','','','']); handleSendOtp({ preventDefault: () => {} }); }}
                  className="w-full text-center text-sm text-white/40 hover:text-primary-400 transition-colors">
                  Resend OTP
                </button>
                <button type="button" onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-white/30 hover:text-white transition-colors">
                  ← Change Email
                </button>
              </motion.form>
            )}

            {/* STEP 3: Profile */}
            {step === 3 && (
              <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCompleteProfile} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" placeholder="Your full name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input pl-10" required />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">I am a...</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ value: 'student', label: '🎓 Student' }, { value: 'faculty', label: '👨‍🏫 Faculty' }].map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                          form.role === value ? 'bg-primary-500/20 border-primary-500/50 text-white' : 'glass border-white/10 text-white/50 hover:border-white/20'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Department</label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="input pl-10 cursor-pointer">
                      <option value="">Select department</option>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Roll Number (student only) */}
                {form.role === 'student' && (
                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">Roll Number <span className="text-white/30">(optional)</span></label>
                    <input type="text" placeholder="e.g. CS21001" value={form.rollNumber}
                      onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                      className="input" />
                  </div>
                )}

                {/* Access Code (faculty only) */}
                {form.role === 'faculty' && (
                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">Faculty Access Code <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input type="password" placeholder="Enter secret code" value={form.accessCode}
                        onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                        className="input pl-10" required />
                    </div>
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Create Account</span><ArrowRight size={18} /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
