import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Clock, User, ArrowLeft, ExternalLink,
  Trophy, CheckCircle, Loader2, Share2, Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
import { getEvent } from '../api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await getEvent(id);
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);


  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <Link to="/events" className="btn-primary mt-4 inline-block">Browse Events</Link>
        </div>
      </div>
    );
  }

  const isUpcoming = event.status === 'upcoming';
  const deadlinePassed = event.deadline && new Date(event.deadline) < new Date();

  const categoryColors = {
    hackathon: 'from-yellow-500/20 to-orange-500/10',
    workshop: 'from-blue-500/20 to-cyan-500/10',
    seminar: 'from-purple-500/20 to-violet-500/10',
    cultural: 'from-pink-500/20 to-rose-500/10',
    sports: 'from-green-500/20 to-emerald-500/10',
    speaker_forum: 'from-orange-500/20 to-amber-500/10',
    competition: 'from-red-500/20 to-rose-500/10',
    other: 'from-teal-500/20 to-cyan-500/10',
  };

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />

      <div className="container-custom pt-24 pb-16">
        {/* Back button */}
        <Link to="/events" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Poster / Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${categoryColors[event.category] || categoryColors.other} group flex items-center justify-center`}
            >
              {event.posterUrl ? (
                <div 
                  className="relative w-full cursor-pointer overflow-hidden max-h-[500px] sm:max-h-[600px] flex items-center justify-center"
                  onClick={() => setShowPosterModal(true)}
                >
                  <img src={event.posterUrl} alt={event.title} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-medium flex items-center gap-2">
                      <ExternalLink size={20} /> View Full Poster
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 sm:h-80 w-full">
                  <div className="text-8xl opacity-20">
                    {event.category === 'hackathon' ? '💻' : event.category === 'workshop' ? '🔧' : event.category === 'cultural' ? '🎭' : event.category === 'sports' ? '🏆' : '📅'}
                  </div>
                </div>
              )}
              
              {/* Gradient overlay for badges only if not a full poster */}
              {!event.posterUrl && <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent pointer-events-none" />}

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <span className={`badge border ${isUpcoming ? 'badge-success' : 'bg-white/10 text-white/50 border-white/20'}`}>
                  {isUpcoming ? '🟢 Upcoming' : '⏹ ' + event.status}
                </span>
              </div>

              {/* Countdown */}
              {isUpcoming && (
                <div className="absolute bottom-4 left-4">
                  <CountdownTimer targetDate={event.date} />
                </div>
              )}
            </motion.div>

            {/* Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-primary capitalize">{event.category?.replace('_', ' ')}</span>
                {event.isFeatured && (
                  <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">⭐ Featured</span>
                )}
                {event.clubName && (
                  <span className="badge bg-white/10 text-white/60 border border-white/15">{event.clubName}</span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">{event.title}</h1>
              <p className="text-white/60 leading-relaxed whitespace-pre-line">{event.description}</p>
            </motion.div>

            {/* Prizes / Eligibility */}
            {(event.prizes || event.eligibility) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {event.prizes && (
                  <div className="card p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={18} className="text-yellow-400" />
                      <span className="font-bold text-white">Prizes</span>
                    </div>
                    <p className="text-white/60 text-sm">{event.prizes}</p>
                  </div>
                )}
                {event.eligibility && (
                  <div className="card p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={18} className="text-blue-400" />
                      <span className="font-bold text-white">Eligibility</span>
                    </div>
                    <p className="text-white/60 text-sm">{event.eligibility}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 sticky top-24 space-y-5"
            >
              {/* Event Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-semibold">{event.date ? format(new Date(event.date), 'EEEE, dd MMMM yyyy') : 'Date TBA'}</div>
                    <div className="text-white/50 text-xs mt-0.5">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-pink-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-semibold">{event.venue}</div>
                    <div className="text-white/50 text-xs mt-0.5">Venue</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={18} className="text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-semibold">{event.organizer}</div>
                    {event.inchargeStaff && <div className="text-white/50 text-xs mt-0.5">Incharge: {event.inchargeStaff}</div>}
                  </div>
                </div>
                {event.deadline && (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className={`mt-0.5 flex-shrink-0 ${deadlinePassed ? 'text-danger' : 'text-orange-400'}`} />
                    <div>
                      <div className={`text-sm font-semibold ${deadlinePassed ? 'text-danger' : 'text-white'}`}>
                        {deadlinePassed ? 'Deadline Passed' : (event.deadline ? format(new Date(event.deadline), 'dd MMM yyyy') : 'No Deadline')}
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">Registration Deadline</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="divider-glow" />

              {(user?.role === 'super_admin' || user?.role === 'faculty') && (
                <Link
                  to={user.role === 'super_admin' ? `/admin/dashboard?edit=${event._id}` : `/faculty/dashboard?edit=${event._id}`}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
                >
                  <Edit3 size={16} /> Edit Event Details
                </Link>
              )}

              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  External Registration <ExternalLink size={14} />
                </a>
              )}

              {/* Share */}
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 glass rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-colors"
              >
                <Share2 size={14} /> Share Event
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full Poster Modal */}
      <AnimatePresence>
        {showPosterModal && event.posterUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPosterModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 cursor-zoom-out backdrop-blur-sm"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={event.posterUrl}
              alt={event.title}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
            
            <button 
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
