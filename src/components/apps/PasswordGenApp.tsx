import React, { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
const SETS = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', num: '0123456789', sym: '!@#$%^&*()_+-=' };
const PasswordGenApp = () => {
  const [len, setLen] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, num: true, sym: true });
  const [pwd, setPwd] = useState('');
  const [copied, setCopied] = useState(false);
  const gen = () => {
    const pool = Object.entries(opts).filter(([, v]) => v).map(([k]) => SETS[k as keyof typeof SETS]).join('');
    if (!pool) return setPwd('');
    let out = '';
    for (let i = 0; i < len; i++) out += pool[Math.floor(Math.random() * pool.length)];
    setPwd(out);
  };
  React.useEffect(gen, []);
  const copy = () => { navigator.clipboard.writeText(pwd); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 p-5 gap-4">
      <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 rounded-lg px-3 py-3 font-mono text-sm break-all">
        <span className="flex-1">{pwd}</span>
        <button onClick={copy}>{copied ? <Check size={16}/> : <Copy size={16}/>}</button>
        <button onClick={gen}><RefreshCw size={16}/></button>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Length: {len}</span>
        <input type="range" min={6} max={32} value={len} onChange={e => setLen(+e.target.value)} className="flex-1 ml-3" />
      </div>
      {Object.keys(SETS).map(k => (
        <label key={k} className="flex items-center justify-between text-sm capitalize">
          {k === 'num' ? 'Numbers' : k === 'sym' ? 'Symbols' : k + 'case'}
          <input type="checkbox" checked={opts[k as keyof typeof opts]} onChange={e => setOpts({ ...opts, [k]: e.target.checked })} />
        </label>
      ))}
      <button onClick={gen} className="mt-auto py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium">Generate</button>
    </div>
  );
};
export default PasswordGenApp;
