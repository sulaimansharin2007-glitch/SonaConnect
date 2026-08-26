import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Star, X, Download, ZoomIn } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from './CountdownTimer';

const categoryColors = {
  hackathon: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30',
  workshop: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
  seminar: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
  cultural: 'text-pink-300 bg-pink-500/20 border-pink-500/30',
  sports: 'text-green-300 bg-green-500/20 border-green-500/30',
  speaker_forum: 'text-orange-300 bg-orange-500/20 border-orange-500/30',
  competition: 'text-red-300 bg-red-500/20 border-red-500/30',
  meeting: 'text-gray-300 bg-gray-500/20 border-gray-500/30',
  other: 'text-teal-300 bg-teal-500/20 border-teal-500/30',
};

const categoryGradients = {
  hackathon: 'from-yellow-500/20 to-orange-500/10',
  workshop: 'from-blue-500/20 to-cyan-500/10',
  seminar: 'from-purple-500/20 to-violet-500/10',
  cultural: 'from-pink-500/20 to-rose-500/10',
  sports: 'from-green-500/20 to-emerald-500/10',
  speaker_forum: 'from-orange-500/20 to-amber-500/10',
  competition: 'from-red-500/20 to-rose-500/10',
  other: 'from-teal-500/20 to-cyan-500/10',
};

function PosterLightbox({ posterUrl, title, onClose }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(posterUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_poster.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(posterUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8 cursor-zoom-out backdrop-blur-sm"
      >
        {/* Image */}
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          src={posterUrl}
          alt={title}
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Top bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Download */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500/80 hover:bg-primary-500 text-slate-900 rounded-xl text-sm font-semibold backdrop-blur-md transition-colors shadow-lg"
          >
            <Download size={16} /> Download
          </motion.button>

          {/* Close */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 rounded-xl flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Bottom title */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
          <p className="text-slate-700/70 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            {title}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function EventCard({ event, index = 0 }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const catColor = categoryColors[event.category] || categoryColors.other;
  const catGrad = categoryGradients[event.category] || categoryGradients.other;
  const isUpcoming = event.status === 'upcoming';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="card overflow-hidden group"
      >
        {/* Poster / Header */}
        <div className={`relative h-44 bg-gradient-to-br ${catGrad} flex items-center justify-center overflow-hidden`}>
          {event.posterUrl ? (
            <div
              className="relative w-full h-full cursor-pointer overflow-hidden"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <span className="flex items-center gap-1.5 text-slate-900 text-sm font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <ZoomIn size={14} /> View Poster
                </span>
              </div>
            </div>
          ) : (
            <div className="text-6xl opacity-20 select-none">
              {event.category === 'hackathon' ? '💻' : event.category === 'workshop' ? '🔧' : event.category === 'cultural' ? '🎭' : event.category === 'sports' ? '🏆' : '📅'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-200/90 via-transparent to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={`badge border ${catColor} capitalize`}>{event.category?.replace('_', ' ')}</span>
            {event.isFeatured && (
              <span className="badge bg-yellow-500/30 text-yellow-300 border border-yellow-500/40">
                <Star size={10} /> Featured
              </span>
            )}
          </div>

          {/* Status */}
          {event.status === 'completed' && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-slate-900/10 text-slate-700/50 border border-slate-900/20">Completed</span>
            </div>
          )}

          {/* Countdown on hover */}
          {isUpcoming && (
            <div className="absolute bottom-3 left-3">
              <CountdownTimer targetDate={event.date} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
            {event.title}
          </h3>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-700/50 text-xs">
              <Calendar size={12} className="text-primary-400 flex-shrink-0" />
              <span>{event.date ? format(new Date(event.date), 'EEE, dd MMM yyyy') : 'Date TBA'} {event.time ? `· ${event.time}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700/50 text-xs">
              <MapPin size={12} className="text-pink-accent flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-2 text-slate-700/50 text-xs">
                <Users size={12} className="text-accent flex-shrink-0" />
                <span className="truncate">{event.organizer}</span>
              </div>
            )}
            {event.registrationCount > 0 && (
              <div className="flex items-center gap-2 text-slate-700/50 text-xs">
                <Users size={12} className="text-yellow-400 flex-shrink-0" />
                <span>{event.registrationCount} registered{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2">
            <Link
              to={`/events/${event._id}`}
              className="flex-1 flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary-500/20 to-pink-accent/10 border border-primary-500/30 rounded-xl text-sm font-semibold text-primary-300 hover:from-primary-500/30 hover:to-pink-accent/20 hover:text-slate-900 transition-all duration-200 group/btn"
            >
              View Details
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>

            {/* Download poster button — only shown when posterUrl exists */}
            {event.posterUrl && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await fetch(event.posterUrl);
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${event.title.replace(/\s+/g, '_')}_poster.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch {
                    window.open(event.posterUrl, '_blank');
                  }
                }}
                title="Download Poster"
                className="w-10 h-10 flex items-center justify-center glass border border-slate-900/15 rounded-xl text-slate-700/60 hover:text-slate-900 hover:border-primary-500/50 transition-all"
              >
                <Download size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightboxOpen && event.posterUrl && (
        <PosterLightbox
          posterUrl={event.posterUrl}
          title={event.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
