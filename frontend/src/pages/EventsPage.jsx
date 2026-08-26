import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import FilterBar from '../components/FilterBar';
import { getEvents } from '../api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
        const { data } = await getEvents(params);
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchEvents, 300);
    return () => clearTimeout(debounce);
  }, [search, category, statusFilter]);

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const dateStr = event.date ? format(parseISO(event.date), 'MMMM d, yyyy (EEEE)') : 'Date TBA';
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {});

  // Sort dates (TBA at the end)
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    if (a === 'Date TBA') return 1;
    if (b === 'Date TBA') return -1;
    return new Date(a) - new Date(b);
  });

  return (
    <div className="min-h-screen bg-white bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Calendar size={20} className="text-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Events</h1>
          </div>
          <p className="text-slate-700/50 ml-[52px]">Browse and register for all campus events</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showStatus
          />
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-700/50">Try adjusting your filters or search query</p>
          </motion.div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-6">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-10">
              {sortedDates.map((dateStr, idx) => (
                <motion.div 
                  key={dateStr}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">{dateStr}</h2>
                    <div className="h-px w-full bg-slate-900/10"></div>
                    <span className="text-slate-500 text-sm whitespace-nowrap bg-slate-900/5 px-3 py-1 rounded-full">
                      {groupedEvents[dateStr].length} event{groupedEvents[dateStr].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedEvents[dateStr].map((event, i) => (
                      <EventCard key={event._id} event={event} index={i} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
