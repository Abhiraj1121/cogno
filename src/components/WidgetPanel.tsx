import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { Activity, Calendar as CalendarIcon, Clock, Edit3, Play, Pause, SkipBack, SkipForward, Music, Cloud, CloudSun, CloudRain, Sun, Link2, Plus, Trash2 } from 'lucide-react';

const WidgetPanel = () => {
  const { isWidgetPanelOpen, toggleWidgetPanel, windows, openWindow } = useOSStore();
  const [time, setTime] = useState(new Date());
  const [note, setNote] = useState(localStorage.getItem('cogno-widget-note') || '');
  const [isPlaying, setIsPlaying] = useState(false);

  const [weather] = useState(() => {
    const conditions = [
      { label: 'Sunny', Icon: Sun, temp: 27 },
      { label: 'Partly Cloudy', Icon: CloudSun, temp: 22 },
      { label: 'Cloudy', Icon: Cloud, temp: 18 },
      { label: 'Light Rain', Icon: CloudRain, temp: 16 },
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  });

  const [quickLinks, setQuickLinks] = useState<{ id: string, label: string, url: string }[]>(() => {
    try {
      const saved = localStorage.getItem('cogno-widget-links');
      return saved ? JSON.parse(saved) : [
        { id: 'l1', label: 'GitHub', url: 'https://github.com' },
        { id: 'l2', label: 'Wikipedia', url: 'https://wikipedia.org' },
      ];
    } catch {
      return [];
    }
  });
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    localStorage.setItem('cogno-widget-links', JSON.stringify(quickLinks));
  }, [quickLinks]);

  const addQuickLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    setQuickLinks(prev => [...prev, { id: crypto.randomUUID(), label: newLinkLabel.trim(), url }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const removeQuickLink = (id: string) => {
    setQuickLinks(prev => prev.filter(l => l.id !== id));
  };

  const openQuickLink = (url: string) => {
    openWindow('browser', 'Browser', url);
  };

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscillatorRef = React.useRef<OscillatorNode | null>(null);

  const togglePlay = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (isPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);

      osc.frequency.linearRampToValueAtTime(225, ctx.currentTime + 2);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWidgetPanelOpen) {
      timer = setInterval(() => setTime(new Date()), 1000);
    }
    return () => clearInterval(timer);
  }, [isWidgetPanelOpen]);

  useEffect(() => {
    localStorage.setItem('cogno-widget-note', note);
  }, [note]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(time.getFullYear(), time.getMonth());
  const firstDay = getFirstDayOfMonth(time.getFullYear(), time.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const ramUsage = Math.min(95, 20 + windows.length * 8);
  const cpuUsage = Math.min(95, 5 + windows.length * 12 + (Math.random() * 10 - 5));

  return (
    <AnimatePresence>
      {isWidgetPanelOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={toggleWidgetPanel} />

          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-[60px] right-2 bottom-20 w-80 z-50 flex flex-col space-y-4 overflow-y-auto no-scrollbar pb-4"
          >

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-3 left-4 text-gray-500 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <Clock size={14} /> <span>Clock</span>
              </div>
              <div className="mt-4 text-5xl font-light text-gray-800 dark:text-gray-100 tracking-tighter">
                {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-3 left-4 text-gray-500 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <Cloud size={14} /> <span>Weather</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-light text-gray-800 dark:text-gray-100">{weather.temp}°</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{weather.label}</div>
                </div>
                <weather.Icon size={44} className="text-[var(--color-accent)] opacity-80" strokeWidth={1.3} />
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-xl relative">
              <div className="absolute top-3 left-4 text-gray-500 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <CalendarIcon size={14} /> <span>Calendar</span>
              </div>
              <div className="mt-6">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
                  <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                  {blanks.map(b => <div key={`blank-${b}`} className="h-8" />)}
                  {days.map(d => (
                    <div
                      key={d}
                      className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full ${d === time.getDate() ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-xl relative">
              <div className="absolute top-3 left-4 text-gray-500 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <Activity size={14} /> <span>System</span>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                    <span>CPU Load</span>
                    <span>{cpuUsage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                    <span>Memory</span>
                    <span>{ramUsage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${ramUsage}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-3 left-4 text-gray-500 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <Music size={14} /> <span>Now Playing</span>
              </div>

              <div className="mt-8 flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md relative overflow-hidden">
                  <Music size={24} className="text-white opacity-80" />
                  {isPlaying && (
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-center space-x-0.5 h-6 opacity-50 px-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          className="w-full bg-white rounded-t-sm"
                          animate={{ height: ['20%', '80%', '40%', '100%', '30%'] }}
                          transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">Ambient Session</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Synthesized Audio</div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between px-2">
                <button className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-3xl shadow-xl relative">
              <div className="absolute top-3 left-4 text-gray-500 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <Link2 size={14} /> <span>Quick Links</span>
              </div>
              <div className="mt-8 space-y-1.5">
                {quickLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between group px-2 py-1.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                  >
                    <button
                      onClick={() => openQuickLink(link.url)}
                      className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
                      title={link.url}
                    >
                      {link.label}
                    </button>
                    <button
                      onClick={() => removeQuickLink(link.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-2"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {quickLinks.length === 0 && (
                  <div className="text-xs text-gray-400 px-2 py-1">No links yet.</div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex items-center gap-1.5">
                <input
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="Name"
                  className="w-1/3 min-w-0 text-xs bg-white/50 dark:bg-white/5 rounded-lg px-2 py-1.5 outline-none placeholder-gray-400"
                />
                <input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="url.com"
                  onKeyDown={(e) => e.key === 'Enter' && addQuickLink()}
                  className="flex-1 min-w-0 text-xs bg-white/50 dark:bg-white/5 rounded-lg px-2 py-1.5 outline-none placeholder-gray-400"
                />
                <button
                  onClick={addQuickLink}
                  className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                  title="Add link"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="bg-yellow-200/80 dark:bg-yellow-600/40 backdrop-blur-xl border border-yellow-300/50 dark:border-yellow-500/20 p-5 rounded-3xl shadow-xl relative flex-1 min-h-[200px]">
              <div className="absolute top-3 left-4 text-yellow-700 dark:text-yellow-400 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <Edit3 size={14} /> <span>Quick Note</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type a quick note here..."
                className="mt-8 w-full h-[calc(100%-2rem)] bg-transparent resize-none outline-none text-yellow-900 dark:text-yellow-100 placeholder-yellow-700/50 dark:placeholder-yellow-300/50 font-medium"
              />
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WidgetPanel;
