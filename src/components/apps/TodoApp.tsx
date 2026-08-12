import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
type Task = { id: string; text: string; done: boolean };
const load = (): Task[] => { try { return JSON.parse(localStorage.getItem('cogno-todos') || '[]'); } catch { return []; } };
const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>(load());
  const [input, setInput] = useState('');
  const save = (t: Task[]) => { setTasks(t); localStorage.setItem('cogno-todos', JSON.stringify(t)); };
  const add = () => { if (!input.trim()) return; save([{ id: crypto.randomUUID(), text: input.trim(), done: false }, ...tasks]); setInput(''); };
  const toggle = (id: string) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = (id: string) => save(tasks.filter(t => t.id !== id));
  const remaining = tasks.filter(t => !t.done).length;
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100">
      <div className="p-3 border-b border-black/10 dark:border-white/10 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add a task…" className="flex-1 bg-black/5 dark:bg-white/10 rounded-lg px-3 py-1.5 text-sm outline-none" />
        <button onClick={add} className="w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center"><Plus size={16}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tasks.map(t => (
          <div key={t.id} className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
            <button onClick={() => toggle(t.id)} className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-gray-400'}`}>{t.done && <Check size={12} className="text-white"/>}</button>
            <span className={`flex-1 text-sm ${t.done ? 'line-through text-gray-400' : ''}`}>{t.text}</span>
            <Trash2 size={14} onClick={() => del(t.id)} className="opacity-0 group-hover:opacity-60 cursor-pointer" />
          </div>
        ))}
        {tasks.length === 0 && <div className="text-center text-sm text-gray-400 mt-8">No tasks yet</div>}
      </div>
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-black/10 dark:border-white/10">{remaining} remaining</div>
    </div>
  );
};
export default TodoApp;
