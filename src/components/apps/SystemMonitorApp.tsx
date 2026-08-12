import React, { useState, useEffect } from 'react';
import { useFileStore } from '../../store/useFileStore';
const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1"><span>{label}</span><span>{value.toFixed(0)}%</span></div>
    <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  </div>
);
const SystemMonitorApp = () => {
  const { files } = useFileStore();
  const [cpu, setCpu] = useState(20);
  const [mem, setMem] = useState(40);
  useEffect(() => {
    const t = setInterval(() => {
      setCpu(c => Math.min(95, Math.max(5, c + (Math.random() * 20 - 10))));
      setMem(m => Math.min(90, Math.max(15, m + (Math.random() * 6 - 3))));
    }, 1200);
    return () => clearInterval(t);
  }, []);
  const fileCount = Object.keys(files).length;
  return (
    <div className="h-full bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 p-5 space-y-5">
      <Bar label="CPU" value={cpu} color="#3b82f6" />
      <Bar label="Memory" value={mem} color="#a855f7" />
      <Bar label="Storage" value={Math.min(80, fileCount * 1.5)} color="#22c55e" />
      <div className="grid grid-cols-2 gap-3 text-sm mt-4">
        <div className="bg-black/5 dark:bg-white/10 rounded-lg p-3"><div className="text-gray-500 text-xs">Files</div><div className="text-lg font-semibold">{fileCount}</div></div>
        <div className="bg-black/5 dark:bg-white/10 rounded-lg p-3"><div className="text-gray-500 text-xs">Processes</div><div className="text-lg font-semibold">{3 + Math.floor(cpu / 10)}</div></div>
      </div>
    </div>
  );
};
export default SystemMonitorApp;
