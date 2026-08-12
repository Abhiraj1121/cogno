import React, { useState } from 'react';
import { Code2, LayoutGrid, FileText, Settings, Grid, Globe } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import StartMenu from './StartMenu';

const Taskbar = () => {
  const { windows, toggleMinimize, openWindow, activeWindowId, dockPosition, dockSize } = useOSStore();
  const [isStartOpen, setIsStartOpen] = useState(false);

  const pinnedApps = [
    { id: 'browser', name: 'Browser', icon: Globe, color: 'text-white', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { id: 'terminal', name: 'Terminal', icon: Code2, color: 'text-white', bg: 'bg-gradient-to-br from-gray-700 to-gray-900' },
    { id: 'files', name: 'Files', icon: LayoutGrid, color: 'text-white', bg: 'bg-gradient-to-br from-indigo-400 to-purple-600' },
    { id: 'editor', name: 'Editor', icon: FileText, color: 'text-white', bg: 'bg-gradient-to-br from-orange-400 to-pink-500' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'text-white', bg: 'bg-gradient-to-br from-gray-400 to-gray-600' },
  ];

  const allApps = [...pinnedApps];
  windows.forEach(w => {
    if (!allApps.some(app => app.id === w.appId)) {
      allApps.push({
        id: w.appId,
        name: w.title || w.appId,
        icon: LayoutGrid,
        color: 'text-white',
        bg: 'bg-gradient-to-br from-gray-500 to-gray-700'
      });
    }
  });

  const handleAppClick = (appId: string, appName: string) => {
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      toggleMinimize(appId);
    } else {
      openWindow(appId, appName);
    }
  };

  const hasMaximizedWindow = windows.some(w => w.isMaximized);
  const isVertical = dockPosition === 'left' || dockPosition === 'right';

  const sizeMap = {
    small: { icon: 'w-9 h-9', inner: 'w-7 h-7', iconSize: 16 },
    medium: { icon: 'w-12 h-12', inner: 'w-9 h-9', iconSize: 20 },
    large: { icon: 'w-14 h-14', inner: 'w-11 h-11', iconSize: 24 },
  };
  const sz = sizeMap[dockSize];

  const positionClasses = {
    bottom: `bottom-4 left-1/2 ${hasMaximizedWindow ? 'translate-y-[150%] -translate-x-1/2' : '-translate-x-1/2'}`,
    left: `left-4 top-1/2 ${hasMaximizedWindow ? '-translate-x-[150%] -translate-y-1/2' : '-translate-y-1/2'}`,
    right: `right-4 top-1/2 ${hasMaximizedWindow ? 'translate-x-[150%] -translate-y-1/2' : '-translate-y-1/2'}`,
  };

  return (
    <>
      <StartMenu isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} />

      <div
        className={`absolute z-[8000] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${positionClasses[dockPosition]}`}
      >
        <div className={`flex ${isVertical ? 'flex-col space-y-2' : 'flex-row space-x-2'} items-center px-3 py-2 ${isVertical ? 'py-3 px-2' : ''} bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl`}>

          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            className={`relative group ${sz.icon} flex items-center justify-center rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-colors`}
          >
            <div className={`${sz.inner} bg-[var(--color-accent)] rounded-lg flex items-center justify-center shadow-sm transition-transform ${isStartOpen ? 'scale-90' : ''}`}>
              <Grid size={sz.iconSize} className="text-white" />
            </div>
            {isStartOpen && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>

          <div className={isVertical ? 'h-px w-8 bg-black/10 dark:bg-white/10 my-1' : 'w-px h-8 bg-black/10 dark:bg-white/10 mx-1'}></div>

          {allApps.map((app) => {
            const isOpen = windows.some(w => w.appId === app.id);
            const isActive = windows.find(w => w.appId === app.id)?.id === activeWindowId;

            return (
              <button
                key={app.id}
                id={`taskbar-icon-${app.id}`}
                className={`relative group ${sz.icon} flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-white/20 dark:bg-white/10' : `hover:bg-white/30 dark:hover:bg-white/10 ${isVertical ? '' : 'hover:-translate-y-1'}`}`}
                title={app.name}
                onClick={() => handleAppClick(app.id, app.name)}
              >
                <div className={`${sz.inner} ${app.bg} rounded-lg flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 ${isActive ? 'scale-95' : ''} transition-transform`}>
                  <app.icon size={sz.iconSize} className={app.color} />
                </div>
                <div className={`absolute ${isVertical ? '-right-1 top-1/2 -translate-y-1/2' : '-bottom-1 left-1/2 -translate-x-1/2'} transition-all duration-300 ${isOpen ? 'w-1.5 h-1.5 opacity-100' : 'w-0 h-0 opacity-0'} ${isActive ? 'bg-[var(--color-accent)] shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-black/50 dark:bg-white/50'} rounded-full`} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Taskbar;
