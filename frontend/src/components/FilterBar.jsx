import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { value: '', label: 'All' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'seminar', label: 'Seminars' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'speakers_forum', label: 'Speakers Forum' },
  { value: 'competition', label: 'Competitions' },
];

export default function FilterBar({ search, setSearch, category, setCategory, statusFilter, setStatusFilter, showStatus = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 pr-9"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              category === cat.value
                ? 'bg-primary-500 text-white shadow-glow'
                : 'glass text-white/60 hover:text-white border border-white/10 hover:border-primary-500/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      {showStatus && setStatusFilter && (
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-36 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      )}
    </motion.div>
  );
}
