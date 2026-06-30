import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { getEvents } from '../api';

export default function WorkshopsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const results = await Promise.all([
          getEvents({ category: 'workshop' }),
          getEvents({ category: 'seminar' }),
          getEvents({ category: 'speaker_forum' }),
        ]);
        const all = [...results[0].data, ...results[1].data, ...results[2].data];
        // Remove duplicates
        const unique = all.filter((e, i, self) => self.findIndex((x) => x._id === e._id) === i);
        setEvents(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = tab === 'all' ? events : events.filter((e) => e.category === tab);

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-black text-white">Workshops & Speaker Forums</h1>
          </div>
          <p className="text-white/50 ml-[52px]">Learn from industry experts, attend seminars and hands-on workshops</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { value: 'all', label: 'All', count: events.length },
            { value: 'workshop', label: '🔧 Workshops', count: events.filter((e) => e.category === 'workshop').length },
            { value: 'seminar', label: '🎤 Seminars', count: events.filter((e) => e.category === 'seminar').length },
            { value: 'speaker_forum', label: '🎙 Speaker Forums', count: events.filter((e) => e.category === 'speaker_forum').length },
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === value ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'glass text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">No workshops found</h3>
            <p className="text-white/50">Stay tuned for upcoming workshops and seminars!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
