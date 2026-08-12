import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code2, LayoutGrid, FileText, Settings, File as FileIcon, Calculator, Globe, Info, Compass, Camera as CameraIcon, StickyNote, Clock, CalendarDays, ListTodo, CloudSun, Paintbrush, Music, Palette, KeyRound, Activity } from 'lucide-react';
import { useFileStore } from '../store/useFileStore';
import { useOSStore } from '../store/useOSStore';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const apps = [
  { id: 'browser', name: 'Browser', icon: Globe, color: 'text-white', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { id: 'files', name: 'Files', icon: LayoutGrid, color: 'text-white', bg: 'bg-gradient-to-br from-indigo-400 to-purple-600' },
  { id: 'editor', name: 'Editor', icon: FileText, color: 'text-white', bg: 'bg-gradient-to-br from-orange-400 to-pink-500' },
  { id: 'terminal', name: 'Terminal', icon: Code2, color: 'text-white', bg: 'bg-gradient-to-br from-gray-700 to-gray-900' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-white', bg: 'bg-gradient-to-br from-orange-300 to-orange-500' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'text-white', bg: 'bg-gradient-to-br from-gray-400 to-gray-600' },
  { id: 'camera', name: 'Camera', icon: CameraIcon, color: 'text-white', bg: 'bg-gradient-to-br from-purple-400 to-pink-600' },
  { id: 'about', name: 'About OS', icon: Info, color: 'text-white', bg: 'bg-gradient-to-br from-teal-400 to-emerald-500' },
  { id: 'notes', name: 'Notes', icon: StickyNote, color: 'text-white', bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500' },
  { id: 'clock', name: 'Clock', icon: Clock, color: 'text-white', bg: 'bg-gradient-to-br from-slate-500 to-slate-700' },
  { id: 'calendar', name: 'Calendar', icon: CalendarDays, color: 'text-white', bg: 'bg-gradient-to-br from-red-400 to-red-600' },
  { id: 'todo', name: 'To-Do', icon: ListTodo, color: 'text-white', bg: 'bg-gradient-to-br from-green-400 to-green-600' },
  { id: 'weather', name: 'Weather', icon: CloudSun, color: 'text-white', bg: 'bg-gradient-to-br from-sky-400 to-blue-500' },
  { id: 'paint', name: 'Paint', icon: Paintbrush, color: 'text-white', bg: 'bg-gradient-to-br from-pink-400 to-rose-500' },
  { id: 'music', name: 'Music', icon: Music, color: 'text-white', bg: 'bg-gradient-to-br from-fuchsia-500 to-purple-700' },
  { id: 'colorpicker', name: 'Color Picker', icon: Palette, color: 'text-white', bg: 'bg-gradient-to-br from-cyan-400 to-teal-500' },
  { id: 'passwordgen', name: 'Password Gen', icon: KeyRound, color: 'text-white', bg: 'bg-gradient-to-br from-violet-500 to-indigo-600' },
  { id: 'sysmonitor', name: 'System Monitor', icon: Activity, color: 'text-white', bg: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
];

const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { files } = useFileStore();
  const { openWindow, toggleMinimize, windows, webApps } = useOSStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleLaunch = (appId: string, name: string) => {
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      toggleMinimize(appId);
    } else {
      openWindow(appId, name);
    }
    onClose();
  };

  const handleOpenFile = (fileId: string) => {
    handleLaunch('editor', 'Editor');
  };

  const filteredApps = apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredWebApps = webApps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredFiles = Object.values(files)
    .filter(f => f.type === 'file' && f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[500px] max-h-[600px] bg-white/70 dark:bg-black/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-6 pb-2">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type here to search apps and files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/10 border-b-2 border-blue-500 outline-none rounded-t-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 font-medium transition-colors focus:bg-white/80 dark:focus:bg-white/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6">
              {(filteredApps.length > 0 || filteredWebApps.length > 0 || searchQuery === '') && (
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Pinned Apps</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {filteredApps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => handleLaunch(app.id, app.name)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors group focus:outline-none"
                      >
                        <div className={`w-12 h-12 mb-2 ${app.bg} rounded-xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform`}>
                          <app.icon size={24} className={app.color} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors truncate w-full text-center px-1">
                          {app.name}
                        </span>
                      </button>
                    ))}

                    {filteredWebApps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          openWindow('browser', app.name, app.url);
                          onClose();
                        }}
                        className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors group focus:outline-none"
                      >
                        <div className="w-12 h-12 mb-2 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform">
                          <Compass size={24} className="text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors truncate w-full text-center px-1">
                          {app.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {filteredFiles.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      {searchQuery ? 'Files' : 'Recent Files'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredFiles.map(file => (
                      <button
                        key={file.id}
                        onClick={() => handleOpenFile(file.id)}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                          <FileIcon size={20} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {new Date(file.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {filteredApps.length === 0 && filteredFiles.length === 0 && (
                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StartMenu;
