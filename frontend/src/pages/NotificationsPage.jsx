import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getNotifications, markAsRead, markAllAsRead } from '../api';

const typeStyles = {
  event: 'bg-primary-500/20 text-primary-300',
  registration: 'bg-accent/20 text-accent',
  announcement: 'bg-yellow-500/20 text-yellow-300',
  reminder: 'bg-orange-500/20 text-orange-300',
  system: 'bg-white/10 text-white/60',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Notifications</h1>
                <p className="text-white/50 text-sm">{unread.length} unread</p>
              </div>
            </div>
            {unread.length > 0 && (
              <button onClick={handleMarkAllRead} className="btn-secondary text-xs flex items-center gap-1.5">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
            <p className="text-white/50">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unread */}
            {unread.length > 0 && (
              <>
                <h3 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Unread</h3>
                {unread.map((n, i) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card p-4 flex items-start gap-4 bg-primary-500/5 border-primary-500/20"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeStyles[n.type] || typeStyles.system}`}>
                      <Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm">{n.title}</h4>
                      <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-white/30 text-[10px] mt-1.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-2 rounded-lg text-white/30 hover:text-primary-400 hover:bg-primary-500/10 flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  </motion.div>
                ))}
              </>
            )}

            {/* Read */}
            {read.length > 0 && (
              <>
                <h3 className="text-white/40 text-xs font-medium uppercase tracking-wider mt-6 mb-2">Earlier</h3>
                {read.map((n, i) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-4 flex items-start gap-4 opacity-60"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeStyles[n.type] || typeStyles.system}`}>
                      <Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm">{n.title}</h4>
                      <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-white/30 text-[10px] mt-1.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
