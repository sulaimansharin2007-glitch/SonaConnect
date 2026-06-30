import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      if (data.role !== 'super_admin') {
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      loginUser(data);
      toast.success('Welcome, Administrator! 🛡️');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-dark to-dark" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 mb-4 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <ShieldCheck size={36} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-2 font-mono tracking-wider uppercase">SonaConnect · Restricted Access</p>
        </motion.div>

        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3 mb-6"
        >
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300/80 text-xs">This area is restricted to authorised administrators only. Unauthorised access is prohibited.</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs text-white/40 mb-2 block font-mono uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="admin@sonaconnect.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all text-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/40 mb-2 block font-mono uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-11 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all text-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                boxShadow: '0 0 30px rgba(220,38,38,0.3)',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Authenticate & Enter
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-white/20 text-xs font-mono">
              SONACONNECT ADMIN · v1.0
            </p>
          </div>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <a href="/" className="text-white/20 hover:text-white/50 text-xs transition-colors font-mono">
            ← Return to main site
          </a>
        </motion.div>
      </div>
    </div>
  );
}
