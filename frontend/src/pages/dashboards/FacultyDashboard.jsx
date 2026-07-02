import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, BookOpen, Users, Loader2, X, Trash2, Edit3, Image
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getEvents, createEvent, updateEvent, deleteEvent, getClubs, getMyManagedClubs } from '../../api';

const categories = ['workshop', 'seminar', 'speakers_forum', 'hackathon', 'other'];
const categoryLabels = { workshop: 'Workshop', seminar: 'Seminar', speakers_forum: 'Speakers Forum', hackathon: 'Hackathon', other: 'Other' };

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [managedClubs, setManagedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultForm = {
    title: '', description: '', category: 'workshop', date: '', time: '', venue: '',
    organizer: '', inchargeStaff: '', registrationLink: '', deadline: '',
    participationType: '', prizes: '', eligibility: '', clubName: '', club: '', posterUrl: ''
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
      const [evRes, clubRes, managedRes] = await Promise.all([getEvents(), getClubs(), getMyManagedClubs()]);
      setEvents(evRes.data);
      setClubs(clubRes.data);
      setManagedClubs(managedRes.data);
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
      maxParticipants: event.maxParticipants || '',
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
      if (data.maxParticipants) data.maxParticipants = Number(data.maxParticipants);
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  const myEvents = events;
  const workshops = myEvents.filter((e) => ['workshop', 'seminar', 'speaker_forum'].includes(e.category));
  const hackathons = myEvents.filter((e) => e.category === 'hackathon');

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white">Faculty Dashboard 👨‍🏫</h1>
          <p className="text-white/50 mt-1">Manage workshops, hackathons and seminars</p>
        </motion.div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openAdd} className="btn-primary flex items-center gap-2 mb-8">
          <Plus size={16} /> Add Workshop / Hackathon
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'All Events', value: myEvents.length, icon: Calendar, gradient: 'from-primary-500/20 to-primary-500/5 border-primary-500/20' },
            { label: 'Workshops', value: workshops.length, icon: BookOpen, gradient: 'from-blue-500/20 to-blue-500/5 border-blue-500/20' },
            { label: 'Hackathons', value: hackathons.length, icon: Users, gradient: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`stat-card bg-gradient-to-br ${s.gradient}`}>
              <div className="flex items-center justify-between">
                <s.icon size={22} className="text-white/70" />
                <span className="text-3xl font-black text-white">{s.value}</span>
              </div>
              <span className="text-white/50 text-sm">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Events Table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-bold text-white">All Events ({myEvents.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Title</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Date</th>
                  <th className="text-right px-5 py-3 text-white/50 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-white/40">
                      <div className="text-4xl mb-2">📋</div>
                      No events yet. Create your first event!
                    </td>
                  </tr>
                ) : (
                  myEvents.map((ev) => (
                    <tr key={ev._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white font-medium max-w-48 truncate">{ev.title}</td>
                      <td className="px-5 py-3"><span className="badge-primary capitalize text-[10px]">{ev.category?.replace('_', ' ')}</span></td>
                      <td className="px-5 py-3 text-white/60">{ev.date ? format(new Date(ev.date), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10" title="Edit Event">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(ev._id)} className="p-1.5 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10" title="Delete Event">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clubs & Members */}
        {managedClubs.length > 0 && (
          <div className="mt-12 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <h2 className="text-2xl font-black text-white">Clubs under my In-charge 🏢</h2>
              <p className="text-white/50 text-sm mt-1">View and manage members of the clubs you supervise</p>
            </motion.div>

            {managedClubs.map((club) => (
              <div key={club._id} className="card p-6 space-y-4 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{club.name}</span>
                      <span className="badge-primary capitalize text-xs">{club.category}</span>
                    </h3>
                    <p className="text-white/40 text-sm mt-1">{club.description || 'No description provided.'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{club.members?.length || 0}</span>
                    <p className="text-white/40 text-xs font-medium">Total Members</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm mb-3">Members Directory</h4>
                  {(!club.members || club.members.length === 0) ? (
                    <p className="text-white/40 text-sm">No members joined yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {club.members.map((member) => (
                        <div key={member._id} className="glass p-4 rounded-2xl flex items-center gap-3 border border-white/5 hover:border-white/10 transition-all">
                          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                            <p className="text-white/40 text-xs truncate">{member.email}</p>
                            <p className="text-primary-400/80 text-[10px] font-mono mt-0.5">
                              {member.department} {member.rollNumber ? `· ${member.rollNumber}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                  {editingEvent ? 'Edit Event' : 'Add Workshop / Hackathon'}
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

    </div>
  );
}
