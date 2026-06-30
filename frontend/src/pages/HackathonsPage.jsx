import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { getEvents } from '../api';

export default function HackathonsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getEvents({ category: 'hackathon' });
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const upcoming = events.filter((e) => e.status === 'upcoming');
  const completed = events.filter((e) => e.status === 'completed');
  const shown = tab === 'upcoming' ? upcoming : completed;

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 rounded-xl flex items-center justify-center shadow-glow-pink border border-yellow-500/30">
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black text-white">Hackathons</h1>
          </div>
          <p className="text-white/50 ml-[52px]">Compete, code, and win in college and external hackathons</p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-red-500/10 border-yellow-500/20 p-6 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Hackathons', value: events.length, emoji: '💻' },
            { label: 'Upcoming', value: upcoming.length, emoji: '🚀' },
            { label: 'Completed', value: completed.length, emoji: '✅' },
            { label: 'Prize Pools', value: events.filter((e) => e.prizes).length, emoji: '🏆' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['upcoming', 'completed'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'glass text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {t} ({t === 'upcoming' ? upcoming.length : completed.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">No {tab} hackathons</h3>
            <p className="text-white/50">Check back soon for new hackathons!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
