import React, { Suspense, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import WindowContainer from './WindowContainer';
import TerminalApp from './apps/TerminalApp';
import FileManagerApp from './apps/FileManagerApp';
import TextEditorApp from './apps/TextEditorApp';
import SettingsApp from './apps/SettingsApp';
import CalculatorApp from './apps/CalculatorApp';
import BrowserApp from './apps/BrowserApp';
import CameraApp from './apps/CameraApp';
import AboutApp from './apps/AboutApp';
import NotesApp from './apps/NotesApp';
import ClockApp from './apps/ClockApp';
import CalendarApp from './apps/CalendarApp';
import TodoApp from './apps/TodoApp';
import WeatherApp from './apps/WeatherApp';
import PaintApp from './apps/PaintApp';
import MusicApp from './apps/MusicApp';
import ColorPickerApp from './apps/ColorPickerApp';
import PasswordGenApp from './apps/PasswordGenApp';
import SystemMonitorApp from './apps/SystemMonitorApp';
import { AnimatePresence } from 'framer-motion';

const WindowManager = () => {
  const { windows, closeWindow, activeWindowId } = useOSStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeWindowId) return;
      if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && e.key === 'w')) {
        e.preventDefault();
        closeWindow(activeWindowId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindowId, closeWindow]);

  const renderApp = (appId: string, windowId: string) => {
    switch (appId) {
      case 'terminal': return <TerminalApp />;
      case 'files': return <FileManagerApp />;
      case 'editor': return <TextEditorApp />;
      case 'settings': return <SettingsApp />;
      case 'camera': return <CameraApp />;
      case 'calculator': return <CalculatorApp />;
      case 'browser': return <BrowserApp windowId={windowId} />;
      case 'about': return <AboutApp />;
      case 'notes': return <NotesApp />;
      case 'clock': return <ClockApp />;
      case 'calendar': return <CalendarApp />;
      case 'todo': return <TodoApp />;
      case 'weather': return <WeatherApp />;
      case 'paint': return <PaintApp />;
      case 'music': return <MusicApp />;
      case 'colorpicker': return <ColorPickerApp />;
      case 'passwordgen': return <PasswordGenApp />;
      case 'sysmonitor': return <SystemMonitorApp />;
      default:
        return (
          <div className="flex items-center justify-center h-full w-full text-black/50 dark:text-white/50 bg-transparent">
            App Content: {appId}
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      {windows.map(windowState => (
        <WindowContainer key={windowState.id} windowState={windowState}>
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            {renderApp(windowState.appId, windowState.id)}
          </Suspense>
        </WindowContainer>
      ))}
    </AnimatePresence>
  );
};

export default WindowManager;
