import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Calendar, Users, Trophy, BookOpen, Bell, Shield,
  ArrowRight, Star, ChevronRight, Sparkles, Globe, Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  { icon: Calendar, title: 'Smart Event Management', desc: 'Centralized hub for all college events with real-time updates, countdown timers, and auto-expiry.', color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20' },
  { icon: Trophy, title: 'Hackathon Hub', desc: 'Discover internal & external hackathons, coding contests and internship drives all in one place.', color: 'from-yellow-500/20 to-orange-500/10 border-yellow-500/20' },
  { icon: Users, title: '16+ Active Clubs', desc: 'From Music to Robotics — join any of our 16 official college clubs and track their events.', color: 'from-purple-500/20 to-violet-500/10 border-purple-500/20' },
  { icon: BookOpen, title: 'Workshops & Speaker Forums', desc: 'Register for industry expert sessions, guest lectures and hands-on workshops with one click.', color: 'from-green-500/20 to-emerald-500/10 border-green-500/20' },
  { icon: Bell, title: 'Real-Time Notifications', desc: 'Never miss an event. Get instant alerts for new events, registration confirmations and deadlines.', color: 'from-pink-500/20 to-rose-500/10 border-pink-500/20' },
  { icon: Shield, title: 'QR Entry Passes', desc: 'Receive a unique QR code after registration. Seamless digital check-in at event venues.', color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/20' },
];

const clubs = [
  { name: 'Programming Club', emoji: '💻', category: 'Technical' },
  { name: 'Music Club', emoji: '🎵', category: 'Cultural' },
  { name: 'Sports Club', emoji: '⚽', category: 'Sports' },
  { name: 'Dexturs Club', emoji: '🤖', category: 'Robotics' },
  { name: 'Modern Theatre', emoji: '🎭', category: 'Arts' },
  { name: 'Tamil Mandram', emoji: '📜', category: 'Cultural' },
  { name: 'Sona Radio', emoji: '📻', category: 'Media' },
  { name: 'Blood Donors', emoji: '🩸', category: 'Social' },
];

const stats = [
  { value: '16+', label: 'Active Clubs', icon: Users },
  { value: '100+', label: 'Events Yearly', icon: Calendar },
  { value: '5000+', label: 'Students', icon: Sparkles },
  { value: '24/7', label: 'Platform Access', icon: Globe },
];

const roles = [
  { title: 'Students', icon: '🎓', desc: 'Discover events, join clubs, register for hackathons and download QR passes.' },
  { title: 'Club Admins', icon: '🏛️', desc: 'Manage your club page, post events, upload posters and track registrations.' },
  { title: 'Faculty', icon: '👨‍🏫', desc: 'Add workshops, speaker forums, seminars and monitor student participation.' },
  { title: 'Super Admin', icon: '⚙️', desc: 'Full platform control — manage users, approve events and monitor analytics.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-accent/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-primary-500/30 mb-8">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-sm text-white/70">Intelligent Campus Activity Platform</span>
              <ChevronRight size={14} className="text-white/40" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
              <span className="text-white">Your Campus,</span>
              <br />
              <span className="gradient-text">Reimagined.</span>
            </h1>

            <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              SonaConnect is the all-in-one platform for Sona College — discover events, join clubs,
              register for hackathons and never miss what's happening on campus.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-glow">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/events" className="btn-secondary px-8 py-3.5 text-base flex items-center gap-2">
                Browse Events <Calendar size={18} />
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
              {stats.map(({ value, label, icon: Icon }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-center gap-3 glass px-5 py-3 rounded-xl border border-white/10"
                >
                  <Icon size={18} className="text-primary-400" />
                  <div className="text-left">
                    <div className="text-xl font-black gradient-text">{value}</div>
                    <div className="text-xs text-white/50">{label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-primary-500/30 mb-4">
                <Star size={12} className="text-primary-400" />
                <span className="text-xs text-white/60">Platform Features</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">Everything You Need,<br /><span className="gradient-text">All In One Place</span></h2>
              <p className="text-white/50 max-w-xl mx-auto">Built for students, clubs, faculty and administrators to manage campus life seamlessly.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`card bg-gradient-to-br ${f.color} p-6`}
              >
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                  <f.icon size={22} className="text-primary-400" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section className="py-24 bg-dark-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-white mb-4">Explore Our <span className="gradient-text">16 Clubs</span></h2>
              <p className="text-white/50 max-w-xl mx-auto">From arts to technology — find your tribe and join the action.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {clubs.map((club, i) => (
              <motion.div
                key={club.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass rounded-2xl p-4 text-center border border-white/10 hover:border-primary-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-2">{club.emoji}</div>
                <div className="text-white text-sm font-semibold leading-tight">{club.name}</div>
                <div className="text-white/40 text-xs mt-1">{club.category}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/clubs" className="btn-primary inline-flex items-center gap-2">
              View All Clubs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-white mb-4">Built For <span className="gradient-text">Everyone</span></h2>
              <p className="text-white/50 max-w-xl mx-auto">Role-based access so students, faculty and admins each get exactly what they need.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="card p-6 text-center"
              >
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{role.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-12 text-center overflow-hidden border border-primary-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-pink-accent/10 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary-500/20 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-4xl font-black text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white/60 text-lg max-w-lg mx-auto mb-8">
                Join thousands of Sona College students already using SonaConnect to stay connected with campus life.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary px-10 py-4 text-base shadow-glow flex items-center gap-2">
                  Create Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary px-10 py-4 text-base">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold gradient-text">SonaConnect</span>
            </div>
            <p className="text-white/30 text-sm">© 2024 SonaConnect — Sona College of Technology. All rights reserved.</p>
            <div className="flex items-center gap-4 text-white/40 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
