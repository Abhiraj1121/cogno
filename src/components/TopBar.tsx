import React, { useState, useEffect } from 'react';
import { Hexagon, Wifi, Bluetooth, Moon, Volume2, Battery, Search, Settings, Power, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';

const TopBarMenu = ({ title, activeAppId }: { title: string, activeAppId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  let items: { label: string, action?: () => void }[] = [];

  if (title === 'File') {
    if (activeAppId === 'editor') {
      items = [
        { label: 'New File', action: () => alert('New File') },
        { label: 'Save', action: () => alert('Please click Save in the Editor toolbar.') },
        { label: 'Close Editor' }
      ];
    } else {
      items = [{ label: 'New Window' }, { label: 'Close Window' }];
    }
  } else if (title === 'Edit') {
    if (activeAppId === 'terminal') {
      items = [{ label: 'Clear Terminal' }, { label: 'Copy Output' }];
    } else {
      items = [{ label: 'Undo' }, { label: 'Redo' }, { label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' }];
    }
  } else {
    items = [{ label: 'Not available' }];
  }

  return (
    <div className="relative h-full flex items-center">
      <button
        className={`px-3 py-1 rounded transition-colors text-sm font-medium ${isOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'}`}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      >
        {title}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.1 }}
            className="absolute top-8 left-0 min-w-[160px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg shadow-xl py-1 overflow-hidden"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full text-left px-4 py-1.5 hover:bg-[var(--color-accent)] hover:text-white transition-colors text-xs"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);

  const { windows, activeWindowId, isDarkMode, setDarkMode, toggleWidgetPanel, openWindow, isAiPanelOpen, toggleAiPanel } = useOSStore();
  const activeWindow = windows.find(w => w.id === activeWindowId);
  const activeAppName = activeWindow ? activeWindow.title : 'Cogno OS';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-50 flex items-center justify-between h-9 px-3 text-sm text-black/90 dark:text-white/90 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg transition-colors duration-300">

      <div className="flex items-center space-x-1 h-full">
        <div className="relative h-full flex items-center">
          <button
            className="px-2 h-full flex items-center rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
            onClick={() => setShowLogoMenu(!showLogoMenu)}
          >
            <Hexagon size={18} className="text-black dark:text-white hover:scale-110 motion-reduce:hover:scale-100 transition-transform" strokeWidth={1.5} />
          </button>

          <AnimatePresence>
            {showLogoMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLogoMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-8 left-1 w-48 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg shadow-xl py-1 overflow-hidden z-50"
                >
                  <button
                    onClick={() => { openWindow('about', 'About OS'); setShowLogoMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-accent)] hover:text-white transition-colors text-xs"
                  >
                    About Cogno OS
                  </button>
                  <div className="h-px bg-black/10 dark:bg-white/10 my-1 mx-2"></div>
                  <button
                    onClick={() => { openWindow('settings', 'Settings'); setShowLogoMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-accent)] hover:text-white transition-colors text-xs flex justify-between items-center"
                  >
                    System Settings...
                    <Settings size={12} />
                  </button>
                  <div className="h-px bg-black/10 dark:bg-white/10 my-1 mx-2"></div>
                  <button
                    onClick={() => { setShowLogoMenu(false); useOSStore.getState().setIsLocked(true); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-accent)] hover:text-white transition-colors text-xs"
                  >
                    Lock Screen
                  </button>
                  <button
                    onClick={() => { window.dispatchEvent(new CustomEvent('system-restart')); setShowLogoMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-accent)] hover:text-white transition-colors text-xs"
                  >
                    Restart...
                  </button>
                  <button
                    onClick={() => { window.dispatchEvent(new CustomEvent('system-shutdown')); setShowLogoMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-500 hover:text-white transition-colors text-xs flex justify-between items-center"
                  >
                    Shut Down...
                    <Power size={12} />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="font-semibold px-2 cursor-default">{activeAppName}</div>

        <div className="hidden md:flex space-x-1 px-1 h-full items-center relative">
          <TopBarMenu title="File" activeAppId={activeWindow?.appId || ''} />
          <TopBarMenu title="Edit" activeAppId={activeWindow?.appId || ''} />
          <TopBarMenu title="View" activeAppId={activeWindow?.appId || ''} />
          <TopBarMenu title="Window" activeAppId={activeWindow?.appId || ''} />
          <TopBarMenu title="Help" activeAppId={activeWindow?.appId || ''} />
        </div>
      </div>

      <div className="flex items-center space-x-1 h-full relative">
        <div className="flex items-center space-x-3 px-3 h-full">
          <button
            className="hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded-lg transition-colors"
            onClick={() => useOSStore.getState().setIsLocked(true)}
            title="Lock Screen"
          >
            <Lock size={15} className="text-black/80 dark:text-white/80 hover:scale-110 motion-reduce:hover:scale-100 transition-transform" strokeWidth={1.5} />
          </button>
          <Wifi size={15} className="text-black/80 dark:text-white/80 hover:scale-110 motion-reduce:hover:scale-100 transition-transform" strokeWidth={1.5} />
          <Bluetooth size={15} className="text-black/80 dark:text-white/80 hover:scale-110 motion-reduce:hover:scale-100 transition-transform" strokeWidth={1.5} />
          <Battery size={15} className="text-black/80 dark:text-white/80 hover:scale-110 motion-reduce:hover:scale-100 transition-transform" strokeWidth={1.5} />

          <button
            className={`flex items-center justify-center focus:outline-none w-6 h-6 rounded-lg transition-all ${
              isAiPanelOpen
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm'
                : 'hover:bg-black/10 dark:hover:bg-white/10 text-black/80 dark:text-white/80'
            }`}
            onClick={toggleAiPanel}
            title="Ask Eka (AI Assistant)"
          >
            <Sparkles size={14} strokeWidth={1.5} />
          </button>

          <button
            className="flex items-center focus:outline-none ml-2 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors group"
            onClick={() => setShowControlCenter(!showControlCenter)}
          >
            <Settings size={16} className="opacity-80 group-hover:opacity-100 group-hover:rotate-45 motion-reduce:group-hover:rotate-0 transition-all duration-300" strokeWidth={1.5} />
          </button>
        </div>

        <div
          className="px-2 font-medium cursor-pointer group relative flex items-center h-full hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"
          title={formatDate(time)}
          onClick={toggleWidgetPanel}
        >
          {formatDate(time)} {formatTime(time)}
        </div>

        <AnimatePresence>
          {showControlCenter && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowControlCenter(false)} />
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-8 right-2 w-72 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl p-3 z-50"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/50 dark:bg-white/10 rounded-xl p-3 flex flex-col justify-between h-20 shadow-sm border border-white/20 dark:border-white/5 cursor-pointer hover:bg-white/60 dark:hover:bg-white/20 transition-colors">
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <Wifi size={14} />
                    </div>
                    <div className="text-xs font-medium">Wi-Fi</div>
                  </div>
                  <div className="bg-white/50 dark:bg-white/10 rounded-xl p-3 flex flex-col justify-between h-20 shadow-sm border border-white/20 dark:border-white/5 cursor-pointer hover:bg-white/60 dark:hover:bg-white/20 transition-colors">
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <Bluetooth size={14} />
                    </div>
                    <div className="text-xs font-medium">Bluetooth</div>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-white/10 rounded-xl p-3 mb-3 shadow-sm border border-white/20 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      <Moon size={14} />
                    </div>
                    <div className="text-xs font-medium">Dark Mode</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDarkMode(!isDarkMode);
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="bg-white/50 dark:bg-white/10 rounded-xl p-3 shadow-sm border border-white/20 dark:border-white/5">
                  <div className="text-xs font-medium mb-2">Display</div>
                  <div className="flex items-center space-x-2">
                    <Moon size={12} className="opacity-50" />
                    <input type="range" className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" defaultValue="70" />
                  </div>

                  <div className="text-xs font-medium mt-3 mb-2">Sound</div>
                  <div className="flex items-center space-x-2">
                    <Volume2 size={12} className="opacity-50" />
                    <input type="range" className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" defaultValue="50" />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TopBar;
