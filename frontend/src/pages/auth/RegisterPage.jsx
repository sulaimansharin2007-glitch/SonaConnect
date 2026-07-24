import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../../api';
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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    rollNumber: '',
    phoneNumber: '',
    accessCode: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (!form.department) {
      return toast.error('Please select your department');
    }
    if (form.role === 'faculty' && !form.accessCode) {
      return toast.error('Please enter the Faculty Access Code');
    }
    if (form.role === 'student' && !form.email.endsWith('@sonatech.ac.in')) {
      return toast.error('Students must use their @sonatech.ac.in email address');
    }

    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data);
      toast.success(`Welcome to SonaConnect, ${data.name}! 🎉`);
      navigate(roleRedirects[data.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-white mt-4">Create Account</h1>
          <p className="text-white/50 text-sm mt-1">Join the campus activity network</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Email */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  className="input pl-10 cursor-pointer" required>
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

            {/* WhatsApp Phone Number (Faculty & Club Admins only) */}
            {(form.role === 'faculty' || form.role === 'club_admin') && (
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">WhatsApp Number <span className="text-white/30">(for posting via bot)</span></label>
                <input type="text" placeholder="e.g. 919876543210 (with country code)" value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="input" required />
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
          </form>

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
