import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music as MusicIcon } from 'lucide-react';
const TRACKS = [{ name: 'Lofi Chill', freq: 220 }, { name: 'Deep Focus', freq: 174 }, { name: 'Morning Calm', freq: 261 }];
const MusicApp = () => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const stop = () => { oscRef.current?.stop(); oscRef.current = null; };
  const toggle = () => {
    if (playing) { stop(); setPlaying(false); return; }
    ctxRef.current ??= new AudioContext();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = TRACKS[idx].freq;
    osc.type = 'sine';
    gain.gain.value = 0.05;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    setPlaying(true);
  };
  const change = (n: number) => { stop(); setPlaying(false); setIdx((idx + n + TRACKS.length) % TRACKS.length); };
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white p-6 gap-5">
      <div className="w-36 h-36 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl">
        <MusicIcon size={56} className={playing ? 'animate-pulse' : ''} />
      </div>
      <div className="text-center">
        <div className="font-semibold">{TRACKS[idx].name}</div>
        <div className="text-xs text-white/70">Cogno Radio</div>
      </div>
      <div className="flex items-center gap-5">
        <button onClick={() => change(-1)}><SkipBack size={20}/></button>
        <button onClick={toggle} className="w-12 h-12 rounded-full bg-white text-purple-700 flex items-center justify-center">{playing ? <Pause size={20}/> : <Play size={20}/>}</button>
        <button onClick={() => change(1)}><SkipForward size={20}/></button>
      </div>
    </div>
  );
};
export default MusicApp;
