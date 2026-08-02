import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Calendar, Users, Trophy, BookOpen, Bell, Shield,
  ArrowRight, Star, ChevronRight, Sparkles, Globe, Clock, CheckCircle2,
  Compass, Terminal, QrCode, MessageSquare, ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';

const bentoItems = [
  {
    title: 'Smart Event Management',
    desc: 'Centralized hub for all Sona College events with real-time updates, countdown timers, and automated attendance.',
    icon: Calendar,
    size: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
    badge: 'Live Operations',
    gradient: 'from-primary-500/20 via-primary-500/5 to-transparent border-primary-500/30',
  },
  {
    title: '16+ Campus Clubs',
    desc: 'From Robotics to Music — join official college clubs in one click.',
    icon: Users,
    size: 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
    badge: 'Active Hub',
    gradient: 'from-pink-accent/20 via-pink-accent/5 to-transparent border-pink-accent/30',
  },
  {
    title: 'Instant QR Entry Passes',
    desc: 'Generate unique digital QR passes upon registration for frictionless event check-ins.',
    icon: QrCode,
    size: 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
    badge: 'Pass Generation',
    gradient: 'from-accent/20 via-accent/5 to-transparent border-accent/30',
  },
  {
    title: 'Hackathons & Internships',
    desc: 'Discover internal & external hackathons, coding contests, and career placement drives all in one unified stream.',
    icon: Trophy,
    size: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1',
    badge: 'Opportunities',
    gradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent border-yellow-500/30',
  },
];

const stats = [
  { value: '16+', label: 'Active Clubs', icon: Users },
  { value: '100+', label: 'Events Yearly', icon: Calendar },
  { value: '5000+', label: 'Students Connected', icon: Sparkles },
  { value: '24/7', label: 'WhatsApp Bot Access', icon: Globe },
];

const roles = [
  { title: 'Students', icon: '🎓', tag: 'Discover & Join', desc: 'Discover events, join active clubs, register for hackathons and download instant QR entry passes.' },
  { title: 'Faculty', icon: '👨‍🏫', tag: 'Publish via WhatsApp', desc: 'Post workshops, speaker forums & seminars directly via WhatsApp poster uploads.' },
  { title: 'Club Admins', icon: '🏛️', tag: 'Manage & Monitor', desc: 'Manage your club page, schedule events, upload posters and track live student attendance.' },
  { title: 'Super Admin', icon: '⚙️', tag: 'System Control', desc: 'Full platform governance — manage user roles, approve events and inspect analytics.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark bg-mesh text-white selection:bg-primary-500 selection:text-white">
      <Navbar />

      {/* ── HERO SECTION: Asymmetric Spotlight Layout ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-pink-accent/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & Action */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full border border-primary-500/30 mb-6">
                <Sparkles size={14} className="text-primary-400" />
                <span className="text-xs font-medium text-white/80">Sona College's Official Activity Platform</span>
                <ChevronRight size={14} className="text-white/40" />
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight mb-6">
                Connect. <br />
                Experience. <br />
                <span className="gradient-text">Lead Campus Life.</span>
              </h1>

              <p className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                The centralized digital ecosystem for Sona College. Discover live events, join clubs,
                register for hackathons, and receive automated WhatsApp notifications.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/events" className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-glow">
                  Explore Campus Events <Calendar size={18} />
                </Link>
                <Link to="/clubs" className="btn-secondary px-8 py-3.5 text-base flex items-center gap-2">
                  View Clubs <ArrowUpRight size={18} />
                </Link>
              </div>

              {/* Quick Feature Badges */}
              <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-white/50">
                <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /> Automated WhatsApp Alerts</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /> Instant QR Passes</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /> AI Poster Extraction</span>
              </div>
            </motion.div>

            {/* Right Column: Dynamic Spotlight Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative glass rounded-3xl p-6 border border-white/15 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-l from-primary-500 to-pink-accent text-[11px] font-extrabold uppercase tracking-wider text-white rounded-bl-2xl">
                  Featured Spotlight
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Sona Innovation Hackathon 2026</h4>
                    <p className="text-white/40 text-xs">Organized by Programming Club</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 glass rounded-xl text-xs">
                    <span className="text-white/50 flex items-center gap-1.5"><Calendar size={14} /> Date</span>
                    <span className="font-semibold text-white">Today • 10:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 glass rounded-xl text-xs">
                    <span className="text-white/50 flex items-center gap-1.5"><Globe size={14} /> Venue</span>
                    <span className="font-semibold text-white">Innovation Square, SCT</span>
                  </div>
                </div>

                <div className="p-4 bg-dark-200/80 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">
                      QR
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Digital Pass Ready</div>
                      <div className="text-[10px] text-white/40">WhatsApp Sync Enabled</div>
                    </div>
                  </div>
                  <Link to="/events" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    Get Pass <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-8 border-y border-white/10 bg-dark-100/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center justify-center gap-4 p-4 glass rounded-2xl border border-white/5">
                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-primary-400">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black gradient-text">{value}</div>
                  <div className="text-xs text-white/50 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ── */}
      <section className="py-24 relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Engineered For <span className="gradient-text">Campus Excellence</span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
              A modern, intelligent architecture designed to streamline event discovery and club governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bentoItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`glass p-8 rounded-3xl border ${item.gradient} ${item.size} flex flex-col justify-between group transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-glow">
                      <item.icon size={22} className="text-primary-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 glass rounded-full border border-white/10 text-white/70">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-primary-400">
                  <span>Explore Module</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE MATRIX SECTION ── */}
      <section className="py-24 bg-dark-100/60 relative border-t border-white/5">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Tailored For <span className="gradient-text">Every Role</span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
              Custom-built experiences for students, faculty members, club leaders, and system admins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl border border-white/10 hover:border-primary-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-4">{role.icon}</div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-md mb-3 inline-block">
                    {role.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-6">{role.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24">
        <div className="container-custom">
          <div className="relative glass rounded-3xl p-12 text-center overflow-hidden border border-primary-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-pink-accent/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Elevate Your Campus Journey Today</h2>
              <p className="text-white/60 text-base max-w-xl mx-auto mb-8">
                Join Sona College's dedicated campus event platform and stay updated with every event.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register" className="btn-primary px-10 py-4 text-base shadow-glow flex items-center gap-2">
                  Create Free Account <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-10 bg-dark-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">SonaConnect</span>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-sm mb-1">© {new Date().getFullYear()} SonaConnect — Sona College of Technology</p>
              <p className="text-white/25 text-xs font-mono">Created by Sharin Banu S, Artificial Intelligence and Data Science, 2024-2028</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
