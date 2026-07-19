import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Calendar, CheckCircle, XCircle, Loader2, Image,
  Trash2, Eye, UserCheck, BarChart3, Plus, Edit3, X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAllEvents, getClubs, approveEvent, deleteEvent, getEventStats, createEvent, updateEvent, updateClub, getAllUsers, deleteUser, extractPosterData } from '../../api';

const categories = ['workshop', 'seminar', 'speakers_forum', 'hackathon', 'other'];
const categoryLabels = { workshop: 'Workshop', seminar: 'Seminar', speakers_forum: 'Speakers Forum', hackathon: 'Hackathon', other: 'Other' };

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('events');
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [extractingAI, setExtractingAI] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [clubForm, setClubForm] = useState({
    name: '', description: '', category: 'technical', facultyIncharge: '', facultyEmail: ''
  });

  const defaultForm = {
    title: '', description: '', category: 'workshop', date: '', time: '', venue: '',
    organizer: '', inchargeStaff: '', registrationLink: '', deadline: '',
    participationType: '', prizes: '', eligibility: '', clubName: '', club: '', posterUrl: '',
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const init = async () => {
      const loadedEvents = await fetchData();
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId && loadedEvents) {
        const found = loadedEvents.find(e => e._id === editId);
        if (found) {
          // Trigger openEdit
          setEditingEvent(found);
          setForm({
            title: found.title,
            description: found.description,
            category: found.category,
            date: found.date ? format(new Date(found.date), 'yyyy-MM-dd') : '',
            time: found.time,
            venue: found.venue,
            organizer: found.organizer,
            inchargeStaff: found.inchargeStaff || '',
            registrationLink: found.registrationLink || '',
            deadline: found.deadline ? format(new Date(found.deadline), 'yyyy-MM-dd') : '',
            participationType: found.participationType || '',
            prizes: found.prizes || '',
            eligibility: found.eligibility || '',
            clubName: found.clubName || '',
            club: found.club?._id || found.club || '',
            posterUrl: found.posterUrl || '',
          });
          setShowModal(true);
        }
      }
    };
    init();
  }, []);

  const fetchData = async () => {
    try {
      const [evRes, clubRes, statRes, userRes] = await Promise.all([
        getAllEvents(),
        getClubs(),
        getEventStats(),
        getAllUsers(),
      ]);
      setEvents(evRes.data);
      setClubs(clubRes.data);
      setStats(statRes.data);
      setUsers(userRes.data);
      return evRes.data;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingEvent(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
      time: event.time,
      venue: event.venue,
      organizer: event.organizer,
      inchargeStaff: event.inchargeStaff || '',
      registrationLink: event.registrationLink || '',
      deadline: event.deadline ? format(new Date(event.deadline), 'yyyy-MM-dd') : '',
      participationType: event.participationType || '',
      prizes: event.prizes || '',
      eligibility: event.eligibility || '',
      clubName: event.clubName || '',
      club: event.club?._id || event.club || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form };
      if (!data.club) delete data.club;
      if (editingEvent) {
        await updateEvent(editingEvent._id, data);
        toast.success('Event updated! ✅');
      } else {
        await createEvent(data);
        toast.success('Event created! 🎉');
      }
      setShowModal(false);
      setEditingEvent(null);
      setForm(defaultForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIExtract = async () => {
    if (!form.posterUrl) return toast.error('Please upload a poster first');
    setExtractingAI(true);
    const toastId = toast.loading('Extracting details using AI...');
    try {
      const { data } = await extractPosterData(form.posterUrl);
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        date: data.date || prev.date,
        time: data.time || prev.time,
        venue: data.venue || prev.venue,
        prizes: data.prizes || prev.prizes,
        eligibility: data.eligibility || prev.eligibility,
        participationType: data.participationType || prev.participationType,
      }));
      toast.success('Fields auto-filled successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('AI Extraction failed. Please fill manually.', { id: toastId });
    } finally {
      setExtractingAI(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEvent(id);
      toast.success('Event approved! ✅');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const openEditClub = (club) => {
    setEditingClub(club);
    setClubForm({
      name: club.name || '',
      description: club.description || '',
      category: club.category || 'technical',
      facultyIncharge: club.facultyIncharge || '',
      facultyEmail: club.facultyEmail || ''
    });
    setShowClubModal(true);
  };

  const handleClubSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClub) {
        await updateClub(editingClub._id, clubForm);
        toast.success('Club updated successfully! ✅');
      }
      setShowClubModal(false);
      setEditingClub(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update club');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  const pendingEvents = events.filter((e) => !e.isApproved);
  const approvedEvents = events.filter((e) => e.isApproved);

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Super Admin Dashboard</h1>
          </div>
          <p className="text-white/50 ml-[52px]">Full platform control — manage events, clubs, and users</p>
        </motion.div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openAdd} className="btn-primary flex items-center gap-2 mb-8 ml-[52px]">
          <Plus size={16} /> Add Event
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Events', value: stats.totalEvents || events.length, icon: Calendar, gradient: 'from-primary-500/20 to-primary-500/5 border-primary-500/20' },
            { label: 'Upcoming', value: stats.upcomingEvents || 0, icon: BarChart3, gradient: 'from-accent/20 to-accent/5 border-accent/20' },
            { label: 'Completed', value: stats.completedEvents || 0, icon: CheckCircle, gradient: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20' },
            { label: 'Hackathons', value: stats.hackathons || 0, icon: BarChart3, gradient: 'from-orange-500/20 to-orange-500/5 border-orange-500/20' },
            { label: 'Active Clubs', value: clubs.length, icon: Users, gradient: 'from-pink-accent/20 to-pink-accent/5 border-pink-accent/20' },
            { label: 'Pending Approval', value: pendingEvents.length, icon: Eye, gradient: 'from-danger/20 to-danger/5 border-danger/20' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`stat-card bg-gradient-to-br ${s.gradient}`}>
              <s.icon size={18} className="text-white/60" />
              <span className="text-2xl font-black text-white">{s.value}</span>
              <span className="text-white/50 text-xs">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'events', label: `All Events (${events.length})` },
            { key: 'pending', label: `Pending (${pendingEvents.length})` },
            { key: 'clubs', label: `Clubs (${clubs.length})` },
            { key: 'users', label: `Users (${users.length})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? 'bg-primary-500 text-white shadow-glow' : 'glass text-white/60 hover:text-white border border-white/10'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        {tab === 'events' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Title</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Category</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Date</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Created By</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Approved</th>
                    <th className="text-right px-5 py-3 text-white/50 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white font-medium max-w-40 truncate">{ev.title}</td>
                      <td className="px-5 py-3"><span className="badge-primary capitalize text-[10px]">{ev.category?.replace('_', ' ')}</span></td>
                      <td className="px-5 py-3 text-white/60">{format(new Date(ev.date), 'dd MMM')}</td>
                      <td className="px-5 py-3 text-white/60 text-xs">{ev.createdBy?.name || '—'}</td>
                      <td className="px-5 py-3"><span className={`badge text-[10px] ${ev.status === 'upcoming' ? 'badge-success' : 'badge-warning'}`}>{ev.status}</span></td>
                      <td className="px-5 py-3">
                        {ev.isApproved ? (
                          <CheckCircle size={16} className="text-accent" />
                        ) : (
                          <XCircle size={16} className="text-danger" />
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!ev.isApproved && (
                            <button onClick={() => handleApprove(ev._id)} className="p-1.5 rounded-lg text-white/40 hover:text-accent hover:bg-accent/10" title="Approve">
                              <UserCheck size={14} />
                            </button>
                          )}
                          <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10" title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(ev._id)} className="p-1.5 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'pending' && (
          pendingEvents.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
              <p className="text-white/50">No events pending approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((ev, i) => (
                <motion.div key={ev._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">{ev.title}</h4>
                    <p className="text-white/40 text-xs mt-0.5">
                      {ev.category?.replace('_', ' ')} · {ev.date ? format(new Date(ev.date), 'dd MMM yyyy') : 'Date TBA'} · by {ev.createdBy?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(ev._id)}
                      className="px-4 py-2 bg-accent/20 border border-accent/40 rounded-xl text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all">
                      Approve
                    </motion.button>
                    <button onClick={() => handleDelete(ev._id)}
                      className="p-2 rounded-xl text-white/40 hover:text-danger hover:bg-danger/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

        {tab === 'clubs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club, i) => (
              <motion.div key={club._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card p-5 relative group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-xl">
                    {club.category === 'technical' ? '💻' : club.category === 'sports' ? '⚽' : club.category === 'cultural' ? '🎭' : club.category === 'literary' ? '📚' : club.category === 'social' ? '🤝' : '🎨'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate pr-6">{club.name}</h4>
                    <span className="badge-primary capitalize text-[10px]">{club.category}</span>
                  </div>
                  <button onClick={() => openEditClub(club)} className="absolute right-4 top-4 p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Club">
                    <Edit3 size={14} />
                  </button>
                </div>
                <div className="flex flex-col gap-1 text-xs text-white/50">
                  <div className="flex justify-between">
                    <span>{club.memberCount || club.members?.length || 0} members</span>
                  </div>
                  {club.facultyIncharge && (
                    <div className="text-[11px] text-white/40 mt-1">
                      🧑‍🏫 {club.facultyIncharge} ({club.facultyEmail})
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input flex-1"
              />
              <span className="text-white/40 text-sm whitespace-nowrap">{users.length} total users</span>
            </div>

            {/* Role counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Students', count: users.filter(u => u.role === 'student').length, icon: '🎓', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20' },
                { label: 'Faculty', count: users.filter(u => u.role === 'faculty').length, icon: '👨‍🏫', color: 'from-green-500/20 to-green-500/5 border-green-500/20' },
                { label: 'Club Admins', count: users.filter(u => u.role === 'club_admin').length, icon: '🏅', color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20' },
                { label: 'Super Admins', count: users.filter(u => u.role === 'super_admin').length, icon: '🛡️', color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20' },
              ].map(s => (
                <div key={s.label} className={`card p-4 bg-gradient-to-br ${s.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-2xl font-black text-white">{s.count}</span>
                  </div>
                  <span className="text-white/50 text-xs mt-1 block">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/50 font-medium">Name</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium">Email</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium">Dept.</th>
                      <th className="text-left px-5 py-3 text-white/50 font-medium">Role</th>

                      <th className="text-left px-5 py-3 text-white/50 font-medium">Joined</th>
                      <th className="text-right px-5 py-3 text-white/50 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => {
                        const q = userSearch.toLowerCase();
                        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
                      })
                      .map((u) => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium max-w-32 truncate">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-white/60 max-w-40 truncate">{u.email}</td>
                          <td className="px-5 py-3 text-white/50 text-xs">{u.department || '—'}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/70 capitalize border border-white/15">
                              {u.role === 'student' ? '🎓' : u.role === 'faculty' ? '👨‍🏫' : u.role === 'club_admin' ? '🏅' : '🛡️'} {u.role?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-white/40 text-xs">{u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : '—'}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end">
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
                                    try {
                                      await deleteUser(u._id);
                                      toast.success('User deleted');
                                      fetchData();
                                    } catch {
                                      toast.error('Failed to delete user');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="px-5 py-12 text-center text-white/40">
                    <div className="text-4xl mb-2">👥</div>
                    No users found.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create / Edit Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-primary-500/30 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Add Event'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors relative overflow-hidden group">
                  {form.posterUrl ? (
                    <>
                      <img src={form.posterUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                      <div className="relative z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Image size={24} className="mx-auto text-white mb-2" />
                        <span className="text-sm text-white font-medium">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
                        <Image size={24} className="text-primary-400" />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">Upload Event Poster</p>
                      <p className="text-xs text-white/50">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
                        const reader = new FileReader();
                        reader.onloadend = () => setForm({ ...form, posterUrl: reader.result });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                {form.posterUrl && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleAIExtract}
                      disabled={extractingAI}
                      className="btn-primary py-2 px-4 text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 flex items-center gap-2"
                    >
                      {extractingAI ? <Loader2 size={14} className="animate-spin" /> : '✨'}
                      {extractingAI ? 'Extracting...' : 'Auto-fill using AI'}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="text-sm text-white/60 mb-1 block">Title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-white/60 mb-1 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24 resize-none" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input cursor-pointer">
                      {categories.map((c) => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
                    </select></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Club</label>
                    <select value={form.club} onChange={(e) => { const s = clubs.find((c) => c._id === e.target.value); setForm({ ...form, club: e.target.value, clubName: s?.name || '' }); }} className="input cursor-pointer">
                      <option value="">None</option>{clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Time</label><input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" className="input" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Venue</label><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="input" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Organizer</label><input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="input" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Incharge Staff</label><input value={form.inchargeStaff} onChange={(e) => setForm({ ...form, inchargeStaff: e.target.value })} className="input" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input" /></div>
                  <div><label className="text-sm text-white/60 mb-1 block">Participation Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Solo', 'Team'].map((pt) => (
                        <button key={pt} type="button" onClick={() => setForm({ ...form, participationType: pt.toLowerCase() })}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                            form.participationType === pt.toLowerCase()
                              ? 'bg-primary-500/20 border-primary-500/50 text-white'
                              : 'glass border-white/10 text-white/50 hover:border-white/20'
                          }`}>
                          {pt === 'Solo' ? '🧑 Solo' : '👥 Team'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-sm text-white/60 mb-1 block">Registration Link</label><input value={form.registrationLink} onChange={(e) => setForm({ ...form, registrationLink: e.target.value })} className="input" /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-white/60 mb-1 block">Prizes</label><input value={form.prizes} onChange={(e) => setForm({ ...form, prizes: e.target.value })} className="input" /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-white/60 mb-1 block">Eligibility</label><input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} className="input" /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Club Edit Modal */}
      <AnimatePresence>
        {showClubModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowClubModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-primary-500/30 rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Club In-charge</h3>
                <button onClick={() => setShowClubModal(false)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10"><X size={18} /></button>
              </div>
              <form onSubmit={handleClubSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Club Name</label>
                  <input value={clubForm.name} readOnly className="input bg-white/5 cursor-not-allowed text-white/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Faculty In-charge Name</label>
                  <input value={clubForm.facultyIncharge} onChange={(e) => setClubForm({ ...clubForm, facultyIncharge: e.target.value })} className="input" placeholder="e.g. Dr. Ramesh Kumar" required />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Faculty Email</label>
                  <input type="email" value={clubForm.facultyEmail} onChange={(e) => setClubForm({ ...clubForm, facultyEmail: e.target.value })} className="input" placeholder="e.g. ramesh@sona.edu.in" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowClubModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
