import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Bell, Trophy, BookOpen, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';
import EventCard from '../../components/EventCard';
import { useAuth } from '../../context/AuthContext';
import { getEvents, getNotifications } from '../../api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [evRes, notifRes] = await Promise.all([
          getEvents({ status: 'upcoming' }),
          getNotifications(),
        ]);
        setEvents(evRes.data.slice(0, 6));
        setNotifications(notifRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Upcoming Events', value: events.length, icon: Clock, color: 'from-primary-500/20 to-primary-500/5 border-primary-500/20' },
    { label: 'Notifications', value: notifications.filter((n) => !n.isRead).length, icon: Bell, color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20' },
  ];

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/50 mt-1">Here's what's happening on campus today</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`stat-card bg-gradient-to-br ${s.color}`}
            >
              <div className="flex items-center justify-between">
                <s.icon size={22} className="text-white/70" />
                <span className="text-3xl font-black text-white">{s.value}</span>
              </div>
              <span className="text-white/50 text-sm">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                <Link to="/events" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
                  See All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.slice(0, 4).map((event, i) => (
                  <EventCard key={event._id} event={event} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="card p-5">
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { to: '/events', label: 'Browse Events', icon: Calendar, color: 'text-primary-400' },
                  { to: '/clubs', label: 'View Clubs', icon: Users, color: 'text-accent' },
                  { to: '/hackathons', label: 'Hackathons', icon: Trophy, color: 'text-yellow-400' },
                  { to: '/workshops', label: 'Workshops', icon: BookOpen, color: 'text-blue-400' },
                ].map(({ to, label, icon: Icon, color }) => (
                  <Link key={to} to={to} className="sidebar-item">
                    <Icon size={16} className={color} /> {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Notifications</h3>
                <Link to="/notifications" className="text-primary-400 text-xs">View all</Link>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-white/40 text-sm">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-primary-400' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-white text-xs font-medium">{n.title}</p>
                        <p className="text-white/40 text-[11px] mt-0.5 line-clamp-1">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
