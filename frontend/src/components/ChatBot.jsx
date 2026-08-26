import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import api from '../api';

const WELCOME = {
  role: 'bot',
  text: `👋 Hi! I'm **SonaBot**, your campus assistant.\n\nAsk me anything about upcoming events — dates, venues, prizes, registration and more! 🎓`
};

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        history: messages.filter(m => m.role !== 'system'),
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '⚠️ Sorry, I couldn\'t reach the server. Please try again shortly!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    'What events are happening today?',
    'Any hackathons coming up?',
    'Which events have prizes?',
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-accent shadow-glow flex items-center justify-center text-slate-900 transition-all duration-300"
        title="Chat with SonaBot"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{ height: '560px', background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(108,99,255,0.15)', backdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-primary-500/10 to-pink-accent/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-pink-accent flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  SonaBot <Sparkles size={12} className="text-primary-500" />
                </div>
                <div className="text-[11px] text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Online · Ask me about campus events
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-50 text-primary-600' : 'bg-gradient-to-br from-primary-500 to-pink-accent text-white'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-50 text-slate-900 rounded-br-sm border border-primary-100'
                        : 'bg-slate-50 text-slate-800 rounded-bl-sm border border-slate-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                  />
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-pink-accent flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts (show only at start) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickPrompts.map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-[11px] px-3 py-1.5 glass rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 glass rounded-2xl border border-slate-300 px-4 py-2.5 bg-white">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about events..."
                  rows={1}
                  className="flex-1 bg-transparent text-slate-900 text-sm placeholder-slate-400 resize-none outline-none leading-relaxed"
                  style={{ maxHeight: '80px' }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-pink-accent flex items-center justify-center text-white disabled:opacity-40 transition-all flex-shrink-0"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-700 text-center mt-2">Powered by AI · SonaConnect</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
