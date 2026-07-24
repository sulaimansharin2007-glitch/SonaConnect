import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trash2, AlertTriangle, User, Mail, Phone, Building, ArrowLeft, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { deleteMyAccount } from '../api';
import Navbar from '../components/Navbar';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      return toast.error('Please type "DELETE" to confirm account deletion.');
    }

    setDeleting(true);
    try {
      await deleteMyAccount();
      toast.success('Your account has been deleted.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 glass rounded-xl text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-white/50 text-sm">Manage your profile and account preferences</p>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-8 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white/90">
            <User size={18} className="text-primary-400" /> Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-white/40 block mb-1 flex items-center gap-1">
                <User size={12} /> Full Name
              </span>
              <p className="font-medium text-white">{user?.name || 'N/A'}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-white/40 block mb-1 flex items-center gap-1">
                <Mail size={12} /> Email Address
              </span>
              <p className="font-medium text-white">{user?.email || 'N/A'}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-white/40 block mb-1 flex items-center gap-1">
                <Building size={12} /> Role / Department
              </span>
              <p className="font-medium text-white capitalize">
                {user?.role?.replace('_', ' ')} {user?.department ? `• ${user.department}` : ''}
              </p>
            </div>

            {user?.phoneNumber && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-xs text-white/40 block mb-1 flex items-center gap-1">
                  <Phone size={12} /> WhatsApp Phone Number
                </span>
                <p className="font-medium text-white">+{user.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone / Delete Account */}
        <div className="glass rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 text-red-400">
                <AlertTriangle size={18} /> Danger Zone
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Permanently delete your SonaConnect account. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-dark max-w-md w-full p-6 rounded-2xl border border-red-500/30 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle size={24} />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white">Are you absolutely sure?</h3>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  This will permanently delete your account (<strong className="text-white">{user?.email}</strong>) and remove your data from SonaConnect.
                </p>
              </div>

              <div className="pt-2">
                <label className="text-xs text-white/50 block mb-1">
                  Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="input text-center font-bold tracking-widest text-red-400 border-red-500/30 focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setConfirmOpen(false); setConfirmText(''); }}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || confirmText !== 'DELETE'}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium flex-1 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={16} /> Delete Forever
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
