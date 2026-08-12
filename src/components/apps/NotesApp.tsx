import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
type Note = { id: string; text: string };
const load = (): Note[] => { try { return JSON.parse(localStorage.getItem('cogno-notes') || '[]'); } catch { return []; } };
const save = (n: Note[]) => localStorage.setItem('cogno-notes', JSON.stringify(n));
const NotesApp = () => {
  const [notes, setNotes] = useState<Note[]>(load());
  const [active, setActive] = useState(notes[0]?.id || '');
  const update = (n: Note[]) => { setNotes(n); save(n); };
  const add = () => { const n = { id: crypto.randomUUID(), text: '' }; const nn = [n, ...notes]; update(nn); setActive(n.id); };
  const del = (id: string) => { const nn = notes.filter(n => n.id !== id); update(nn); if (active === id) setActive(nn[0]?.id || ''); };
  const edit = (text: string) => update(notes.map(n => n.id === active ? { ...n, text } : n));
  const current = notes.find(n => n.id === active);
  return (
    <div className="flex h-full bg-yellow-50 dark:bg-[#1a1a1a] text-sm">
      <div className="w-40 border-r border-black/10 dark:border-white/10 flex flex-col">
        <button onClick={add} className="flex items-center gap-1 p-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"><Plus size={14}/> New</button>
        <div className="flex-1 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} onClick={() => setActive(n.id)} className={`group flex items-center justify-between px-2 py-2 cursor-pointer ${active === n.id ? 'bg-yellow-200/60 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <span className="truncate">{n.text.split('\n')[0] || 'Untitled'}</span>
              <Trash2 size={12} className="opacity-0 group-hover:opacity-60" onClick={(e) => { e.stopPropagation(); del(n.id); }} />
            </div>
          ))}
        </div>
      </div>
      <textarea
        value={current?.text || ''}
        onChange={(e) => edit(e.target.value)}
        placeholder={current ? 'Start typing…' : 'Create a note to begin'}
        disabled={!current}
        className="flex-1 p-4 bg-transparent outline-none resize-none font-mono"
      />
    </div>
  );
};
export default NotesApp;
