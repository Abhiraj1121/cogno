import React, { useRef, useState } from 'react';
import { Trash2, Download } from 'lucide-react';
const COLORS = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ffffff'];
const PaintApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);
  const drawing = useRef(false);
  const pos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const start = (e: React.MouseEvent) => { drawing.current = true; const ctx = canvasRef.current!.getContext('2d')!; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw = (e: React.MouseEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.stroke();
  };
  const stop = () => drawing.current = false;
  const clear = () => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); };
  const download = () => { const a = document.createElement('a'); a.download = 'painting.png'; a.href = canvasRef.current!.toDataURL(); a.click(); };
  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-2 p-2 border-b border-black/10 dark:border-white/10">
        {COLORS.map(c => <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-[var(--color-accent)]' : 'border-transparent'}`} style={{ background: c }} />)}
        <input type="range" min={1} max={20} value={size} onChange={e => setSize(+e.target.value)} className="mx-2" />
        <div className="flex-1" />
        <button onClick={clear} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"><Trash2 size={16}/></button>
        <button onClick={download} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"><Download size={16}/></button>
      </div>
      <canvas ref={canvasRef} width={760} height={480} className="flex-1 w-full bg-white cursor-crosshair" onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop} />
    </div>
  );
};
export default PaintApp;
