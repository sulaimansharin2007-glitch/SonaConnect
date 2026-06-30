import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, User, Mail, Calendar, Megaphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { getClub, joinClub, getEvents } from '../api';
import { useAuth } from '../context/AuthContext';

const categoryEmoji = { cultural: '🎭', technical: '💻', sports: '⚽', literary: '📚', social: '🤝', arts: '🎨' };

export default function ClubDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState('events');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [clubRes, eventsRes] = await Promise.all([
          getClub(id),
          getEvents({ club: id }),
        ]);
        setClub(clubRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinClub(id);
      toast.success('Joined club! 🎉');
      const { data } = await getClub(id);
      setClub(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Club Not Found</h2>
          <Link to="/clubs" className="btn-primary mt-4 inline-block">Browse Clubs</Link>
        </div>
      </div>
    );
  }

  const isMember = club.members?.some((m) => m._id === user?._id || m === user?._id);

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <Link to="/clubs" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Clubs
        </Link>

        {/* Club Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-4xl shadow-glow flex-shrink-0">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt={club.name} className="w-full h-full rounded-3xl object-cover" />
              ) : (
                categoryEmoji[club.category] || '🏛️'
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white">{club.name}</h1>
                <span className="badge-primary capitalize">{club.category}</span>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">{club.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/50">
                  <Users size={16} className="text-primary-400" />
                  <span>{club.memberCount || club.members?.length || 0} members</span>
                </div>
                {club.facultyIncharge && (
                  <div className="flex items-center gap-2 text-white/50">
                    <User size={16} className="text-accent" />
                    <span>{club.facultyIncharge}</span>
                  </div>
                )}
                {club.facultyEmail && (
                  <div className="flex items-center gap-2 text-white/50">
                    <Mail size={16} className="text-pink-accent" />
                    <span>{club.facultyEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {user?.role === 'student' && !isMember && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={joining}
                className="btn-primary flex-shrink-0"
              >
                {joining ? <Loader2 size={16} className="animate-spin" /> : 'Join Club'}
              </motion.button>
            )}
            {isMember && (
              <span className="badge-success flex-shrink-0">✓ Member</span>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['events', 'announcements'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-primary-500 text-white shadow-glow' : 'glass text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {t === 'events' ? <Calendar size={14} className="inline mr-1.5" /> : <Megaphone size={14} className="inline mr-1.5" />}
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'events' ? (
          events.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-white/50">No events yet from this club</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {club.announcements?.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📢</div>
                <p className="text-white/50">No announcements yet</p>
              </div>
            ) : (
              club.announcements?.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5"
                >
                  <h4 className="font-bold text-white mb-1">{a.title}</h4>
                  <p className="text-white/60 text-sm">{a.message}</p>
                  {a.createdAt && (
                    <p className="text-white/30 text-xs mt-2">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
