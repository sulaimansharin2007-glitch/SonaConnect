import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import ClubCard from '../components/ClubCard';
import { getClubs } from '../api';

const categories = ['all', 'cultural', 'technical', 'sports', 'literary', 'social', 'arts'];

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data } = await getClubs();
        setClubs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const filtered = clubs.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Users size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Clubs</h1>
          </div>
          <p className="text-white/50 ml-[52px]">Explore and join our 16 college clubs</p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                  category === cat
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'glass text-white/60 hover:text-white border border-white/10 hover:border-primary-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-white mb-2">No clubs found</h3>
            <p className="text-white/50">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((club, i) => (
              <ClubCard key={club._id} club={club} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
