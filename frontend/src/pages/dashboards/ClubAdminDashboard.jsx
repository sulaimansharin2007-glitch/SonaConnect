import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, Edit3, Trash2, Loader2, Image, Link as LinkIcon,
  Clock, MapPin, Users, X, Megaphone, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getEvents, createEvent, updateEvent, deleteEvent, getClubs, addAnnouncement } from '../../api';

const categories = ['hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'speakers_forum', 'meeting', 'other'];
const categoryLabels = { hackathon: 'Hackathon', workshop: 'Workshop', seminar: 'Seminar', cultural: 'Cultural', sports: 'Sports', speakers_forum: 'Speakers Forum', meeting: 'Meeting', other: 'Other' };

export default function ClubAdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'other', date: '', time: '', venue: '',
    organizer: '', inchargeStaff: '', registrationLink: '', deadline: '', participationType: '',
    prizes: '', eligibility: '', posterUrl: '', clubName: '', club: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', clubId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evRes, clubRes] = await Promise.all([getEvents(), getClubs()]);
      setEvents(evRes.data);
      setClubs(clubRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingEvent(null);
    setForm({
      title: '', description: '', category: 'other', date: '', time: '', venue: '',
      organizer: '', inchargeStaff: '', registrationLink: '', deadline: '', participationType: '',
      prizes: '', eligibility: '', posterUrl: '', clubName: '', club: '',
    });
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title, description: event.description, category: event.category,
      date: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
      time: event.time, venue: event.venue, organizer: event.organizer,
      inchargeStaff: event.inchargeStaff || '', registrationLink: event.registrationLink || '',
      deadline: event.deadline ? format(new Date(event.deadline), 'yyyy-MM-dd') : '',
      participationType: event.participationType || '', prizes: event.prizes || '',
      eligibility: event.eligibility || '', posterUrl: event.posterUrl || '', clubName: event.clubName || '',
      club: event.club?._id || event.club || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form };
      if (editingEvent) {
        await updateEvent(editingEvent._id, data);
        toast.success('Event updated! ✅');
      } else {
        await createEvent(data);
        toast.success('Event created! 🎉');
      }
      setShowModal(false);
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
      toast.error('Failed to delete');
    }
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.clubId) return toast.error('Select a club');
    setSubmitting(true);
    try {
      await addAnnouncement(announcementForm.clubId, {
        title: announcementForm.title,
        message: announcementForm.message,
      });
      toast.success('Announcement posted! 📢');
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', message: '', clubId: '' });
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <div className="container-custom pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white">Club Admin Dashboard 🏛️</h1>
          <p className="text-white/50 mt-1">Manage your club events, posters and announcements</p>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Event
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAnnouncementModal(true)} className="btn-secondary flex items-center gap-2">
            <Megaphone size={16} /> Post Announcement
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: events.length, color: 'border-primary-500/20' },
            { label: 'Upcoming', value: events.filter((e) => e.status === 'upcoming').length, color: 'border-accent/20' },
            { label: 'Completed', value: events.filter((e) => e.status === 'completed').length, color: 'border-yellow-500/20' },
            { label: 'Total Clubs', value: clubs.length, color: 'border-pink-accent/20' },
          ].map((s) => (
            <div key={s.label} className={`stat-card border ${s.color}`}>
              <span className="text-2xl font-black text-white">{s.value}</span>
              <span className="text-white/50 text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Events Table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-bold text-white">Events ({events.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Title</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Reg.</th>
                  <th className="text-right px-5 py-3 text-white/50 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-white font-medium max-w-48 truncate">{ev.title}</td>
                    <td className="px-5 py-3">
                      <span className="badge-primary capitalize text-[10px]">{ev.category?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3 text-white/60">{format(new Date(ev.date), 'dd MMM yyyy')}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-[10px] ${ev.status === 'upcoming' ? 'badge-success' : 'badge-warning'}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/60">{ev.registrationCount || 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg text-white/40 hover:text-primary-400 hover:bg-primary-500/10 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(ev._id)} className="p-1.5 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10 transition-colors">
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
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-primary-500/30 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
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
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/60 mb-1 block">Title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/60 mb-1 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24 resize-none" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input cursor-pointer">
                      {categories.map((c) => <option key={c} value={c} className="capitalize">{categoryLabels[c] || c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Club</label>
                    <select value={form.club} onChange={(e) => {
                      const selected = clubs.find((c) => c._id === e.target.value);
                      setForm({ ...form, club: e.target.value, clubName: selected?.name || '' });
                    }} className="input cursor-pointer">
                      <option value="">None</option>
                      {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Time</label>
                    <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM" className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Venue</label>
                    <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Organizer</label>
                    <input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Incharge Staff</label>
                    <input value={form.inchargeStaff} onChange={(e) => setForm({ ...form, inchargeStaff: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Registration Deadline</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/60 mb-1 block">Participation Type</label>
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
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Registration Link</label>
                    <input value={form.registrationLink} onChange={(e) => setForm({ ...form, registrationLink: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/60 mb-1 block">Prizes</label>
                    <input value={form.prizes} onChange={(e) => setForm({ ...form, prizes: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/60 mb-1 block">Eligibility</label>
                    <input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} className="input" />
                  </div>
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

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowAnnouncementModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-primary-500/30 rounded-3xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Post Announcement</h3>
                <button onClick={() => setShowAnnouncementModal(false)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10"><X size={18} /></button>
              </div>
              <form onSubmit={handleAnnouncement} className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Club *</label>
                  <select value={announcementForm.clubId} onChange={(e) => setAnnouncementForm({ ...announcementForm, clubId: e.target.value })} className="input cursor-pointer" required>
                    <option value="">Select club</option>
                    {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Title *</label>
                  <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Message *</label>
                  <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} className="input min-h-24 resize-none" required />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAnnouncementModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
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
