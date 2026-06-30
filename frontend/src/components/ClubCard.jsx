import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight } from 'lucide-react';

const categoryEmoji = {
  cultural: '🎭',
  technical: '💻',
  sports: '⚽',
  literary: '📚',
  social: '🤝',
  arts: '🎨',
};

const categoryColors = {
  cultural: 'from-pink-500/20 to-rose-500/10 border-pink-500/20',
  technical: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20',
  sports: 'from-green-500/20 to-emerald-500/10 border-green-500/20',
  literary: 'from-purple-500/20 to-violet-500/10 border-purple-500/20',
  social: 'from-orange-500/20 to-amber-500/10 border-orange-500/20',
  arts: 'from-teal-500/20 to-cyan-500/10 border-teal-500/20',
};

export default function ClubCard({ club, index = 0 }) {
  const gradient = categoryColors[club.category] || categoryColors.cultural;
  const emoji = categoryEmoji[club.category] || '🏛️';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`card overflow-hidden group bg-gradient-to-br ${gradient} cursor-pointer`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-3xl shadow-card group-hover:scale-110 transition-transform duration-300">
            {club.logoUrl ? (
              <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              emoji
            )}
          </div>
          <span className={`badge capitalize ${
            club.category === 'technical' ? 'badge-primary' :
            club.category === 'sports' ? 'badge-success' :
            'bg-white/10 text-white/60 border border-white/15'
          }`}>
            {club.category}
          </span>
        </div>

        {/* Name & Description */}
        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary-300 transition-colors">
          {club.name}
        </h3>
        <p className="text-white/50 text-xs mt-1.5 line-clamp-2 leading-relaxed">
          {club.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Users size={12} className="text-primary-400" />
            <span>{club.memberCount || club.members?.length || 0} members</span>
          </div>
          {club.facultyIncharge && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs truncate">
              <Calendar size={12} className="text-pink-accent" />
              <span className="truncate">{club.facultyIncharge}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/clubs/${club._id}`}
          className="mt-4 flex items-center justify-between w-full px-4 py-2.5 glass border border-white/15 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/10 transition-all duration-200 group/btn"
        >
          View Club
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
