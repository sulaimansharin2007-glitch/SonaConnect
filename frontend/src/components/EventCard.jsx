import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight, Star } from 'lucide-react';
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

export default function EventCard({ event, index = 0 }) {
  const catColor = categoryColors[event.category] || categoryColors.other;
  const catGrad = categoryGradients[event.category] || categoryGradients.other;
  const isUpcoming = event.status === 'upcoming';

  return (
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
          <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl opacity-20 select-none">
            {event.category === 'hackathon' ? '💻' : event.category === 'workshop' ? '🔧' : event.category === 'cultural' ? '🎭' : event.category === 'sports' ? '🏆' : '📅'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-200/90 via-transparent to-transparent" />

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
            <span className="badge bg-white/10 text-white/50 border border-white/20">Completed</span>
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
        <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
          {event.title}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Calendar size={12} className="text-primary-400 flex-shrink-0" />
            <span>{format(new Date(event.date), 'EEE, dd MMM yyyy')} · {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <MapPin size={12} className="text-pink-accent flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          {event.organizer && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Users size={12} className="text-accent flex-shrink-0" />
              <span className="truncate">{event.organizer}</span>
            </div>
          )}
          {event.registrationCount > 0 && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Users size={12} className="text-yellow-400 flex-shrink-0" />
              <span>{event.registrationCount} registered{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
            </div>
          )}
        </div>

        <Link
          to={`/events/${event._id}`}
          className="mt-4 flex items-center justify-between w-full px-4 py-2.5 bg-gradient-to-r from-primary-500/20 to-pink-accent/10 border border-primary-500/30 rounded-xl text-sm font-semibold text-primary-300 hover:from-primary-500/30 hover:to-pink-accent/20 hover:text-white transition-all duration-200 group/btn"
        >
          View Details
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
