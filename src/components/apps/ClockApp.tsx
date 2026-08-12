import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 10)).padStart(2, '0')}`;
};
const ClockApp = () => {
  const [tab, setTab] = useState<'clock' | 'stopwatch'>('clock');
  const [now, setNow] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed;
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), 30);
    return () => clearInterval(t);
  }, [running]);
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100">
      <div className="flex justify-center gap-2 p-2 border-b border-black/10 dark:border-white/10 text-xs">
        {(['clock', 'stopwatch'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded-full capitalize ${tab === t ? 'bg-[var(--color-accent)] text-white' : 'bg-black/5 dark:bg-white/10'}`}>{t}</button>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {tab === 'clock' ? (
          <>
            <div className="text-6xl font-thin tabular-nums">{now.toLocaleTimeString()}</div>
            <div className="text-gray-500">{now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </>
        ) : (
          <>
            <div className="text-5xl font-thin tabular-nums">{fmt(elapsed)}</div>
            <div className="flex gap-3">
              <button onClick={() => setRunning(r => !r)} className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center">{running ? <Pause size={18}/> : <Play size={18}/>}</button>
              <button onClick={() => { setRunning(false); setElapsed(0); }} className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center"><RotateCcw size={18}/></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ClockApp;
