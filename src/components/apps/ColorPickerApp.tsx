import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
const hexToRgb = (h: string) => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`; };
const ColorPickerApp = () => {
  const [color, setColor] = useState('#6366f1');
  const [copied, setCopied] = useState('');
  const copy = (v: string) => { navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(''), 1200); };
  const shades = [0.8, 0.6, 0.4, 0.2].map(f => {
    const n = parseInt(color.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `rgb(${r}, ${g}, ${b})`;
  });
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 p-5 gap-4">
      <div className="h-32 rounded-2xl shadow-inner" style={{ background: color }} />
      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
      {[['HEX', color], ['RGB', hexToRgb(color)]].map(([label, val]) => (
        <div key={label} className="flex items-center justify-between bg-black/5 dark:bg-white/10 rounded-lg px-3 py-2 text-sm">
          <span className="font-mono">{label}: {val}</span>
          <button onClick={() => copy(val)}>{copied === val ? <Check size={14}/> : <Copy size={14}/>}</button>
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        {shades.map((s, i) => <div key={i} className="flex-1 h-10 rounded-lg cursor-pointer" style={{ background: s }} onClick={() => copy(s)} />)}
      </div>
    </div>
  );
};
export default ColorPickerApp;
