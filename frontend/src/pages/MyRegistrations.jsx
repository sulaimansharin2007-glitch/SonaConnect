import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Loader2, Trash2, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getMyEvents, cancelRegistration } from '../api';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    fetchRegs();
  }, []);

  const fetchRegs = async () => {
    try {
      const { data } = await getMyEvents();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this registration?')) return;
    try {
      await cancelRegistration(id);
      toast.success('Registration cancelled');
      fetchRegs();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Calendar size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">My Registrations</h1>
          </div>
          <p className="text-white/50 ml-[52px]">Track your registered events and QR passes</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No registrations yet</h3>
            <p className="text-white/50 mb-4">Browse events and register to see them here</p>
            <Link to="/events" className="btn-primary inline-block">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg, i) => (
              <motion.div
                key={reg._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Event info */}
                <Link to={`/events/${reg.event?._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-pink-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {reg.event?.category === 'hackathon' ? '💻' : reg.event?.category === 'workshop' ? '🔧' : reg.event?.category === 'cultural' ? '🎭' : reg.event?.category === 'sports' ? '🏆' : '📅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate hover:text-primary-300 transition-colors">{reg.event?.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <Calendar size={11} /> {reg.event?.date ? format(new Date(reg.event.date), 'dd MMM yyyy') : (reg.event?.createdAt ? format(new Date(reg.event.createdAt), 'dd MMM yyyy') : 'Date TBA')}
                      </span>
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <Clock size={11} /> {reg.event?.time || '—'}
                      </span>
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <MapPin size={11} /> {reg.event?.venue || '—'}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge text-[10px] ${
                    reg.event?.status === 'upcoming' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {reg.event?.status || 'registered'}
                  </span>

                  <button
                    onClick={() => setShowQR(reg)}
                    className="px-3 py-1.5 glass rounded-lg border border-primary-500/30 text-primary-300 text-xs font-medium hover:bg-primary-500/10 transition-all"
                  >
                    QR Pass
                  </button>

                  {reg.event?.status === 'upcoming' && (
                    <button
                      onClick={() => handleCancel(reg._id)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-primary-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-card-hover"
            >
              <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white"><X size={18} /></button>
              <h3 className="text-xl font-bold text-white mb-2">QR Entry Pass</h3>
              <p className="text-white/50 text-sm mb-6">{showQR.event?.title}</p>

              <div className="bg-white rounded-2xl p-6 inline-block mb-6">
                {showQR.qrCode ? (
                  <img src={showQR.qrCode} alt="QR Code" className="w-44 h-44" />
                ) : (
                  <QRCode
                    value={showQR.qrData || JSON.stringify({ id: showQR._id, event: showQR.event?.title })}
                    size={176}
                    fgColor="#6C63FF"
                  />
                )}
              </div>

              <div className="space-y-2 text-left glass rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Date</span>
                  <span className="text-white font-medium">{showQR.event?.date ? format(new Date(showQR.event.date), 'dd MMM yyyy') : (showQR.event?.createdAt ? format(new Date(showQR.event.createdAt), 'dd MMM yyyy') : 'Date TBA')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Venue</span>
                  <span className="text-white font-medium">{showQR.event?.venue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Status</span>
                  <span className="text-accent font-medium capitalize">{showQR.attendanceStatus}</span>
                </div>
              </div>

              <button onClick={() => setShowQR(null)} className="btn-primary w-full">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
