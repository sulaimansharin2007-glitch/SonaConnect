import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Menu, X, LogOut, User, ChevronDown,
  Zap, Calendar, Users, Trophy, BookOpen, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllAsRead } from '../api';

const navLinks = [
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Clubs', href: '/clubs', icon: Users },
  { label: 'Hackathons', href: '/hackathons', icon: Trophy },
  { label: 'Workshops', href: '/workshops', icon: BookOpen },
];

const getDashboardLink = (role) => {
  const map = {
    student: '/student/dashboard',
    club_admin: '/club/dashboard',
    faculty: '/faculty/dashboard',
    super_admin: '/admin/dashboard',
  };
  return map[role] || '/';
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      getNotifications().then(({ data }) => setNotifications(data)).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-pink transition-all duration-300">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SonaConnect</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === href
                      ? 'text-white bg-primary-500/20 border border-primary-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-80 glass-dark border border-white/10 rounded-2xl shadow-card-hover overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                          <span className="font-semibold text-sm">Notifications</span>
                          <button onClick={handleMarkAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-white/40 text-sm">No notifications</div>
                          ) : (
                            notifications.slice(0, 8).map((n) => (
                              <div key={n._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-primary-500/5' : ''}`}>
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-primary-400' : 'bg-white/20'}`} />
                                  <div>
                                    <p className="text-sm font-medium text-white">{n.title}</p>
                                    <p className="text-xs text-white/50 mt-0.5">{n.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="block p-3 text-center text-xs text-primary-400 hover:text-primary-300 transition-colors border-t border-white/10"
                        >
                          View all notifications →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:border-primary-500/40 transition-all"
                  >
                    <div className="w-7 h-7 bg-gradient-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden sm:block max-w-24 truncate">{user.name}</span>
                    <ChevronDown size={14} className={`text-white/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-52 glass-dark border border-white/10 rounded-2xl shadow-card-hover overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-white/50 mt-0.5">{user.email}</p>
                          <span className="badge-primary mt-2 inline-block capitalize">{user.role?.replace('_', ' ')}</span>
                        </div>
                        <div className="p-2">
                          <Link
                            to={getDashboardLink(user.role)}
                            onClick={() => setProfileOpen(false)}
                            className="sidebar-item text-white/70 hover:text-white"
                          >
                            <Settings size={16} /> Dashboard
                          </Link>
                          {user.role === 'student' && (
                            <Link to="/my-events" onClick={() => setProfileOpen(false)} className="sidebar-item text-white/70 hover:text-white">
                              <Calendar size={16} /> My Events
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="sidebar-item w-full text-danger/80 hover:text-danger hover:bg-danger/10"
                          >
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Join Now</Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    location.pathname === href ? 'text-white bg-primary-500/20' : 'text-white/60'
                  }`}
                >
                  <Icon size={18} /> {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
