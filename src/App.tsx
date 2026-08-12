import { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Taskbar from './components/Taskbar';
import Desktop from './components/Desktop';
import WindowManager from './components/WindowManager';
import BootScreen from './components/BootScreen';
import WidgetPanel from './components/WidgetPanel';
import AiPanel from './components/AiPanel';
import ShutDownScreen from './components/ShutDownScreen';
import LockScreen from './components/LockScreen';
import CustomCursor from './components/CustomCursor';
import { useFileStore } from './store/useFileStore';
import { useOSStore } from './store/useOSStore';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);
  const { initDB, isReady } = useFileStore();
  const { isDarkMode, accentColor, isLocked, glassOpacity, glassBlur } = useOSStore();

  useEffect(() => {
    initDB();
  }, [initDB]);

  useEffect(() => {
    const handleShutdown = () => setIsShutDown(true);
    const handleRestart = () => {
      setIsBooted(false);
      setIsShutDown(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useOSStore.getState().setIsLocked(true);
      }
    };

    window.addEventListener('system-shutdown', handleShutdown);
    window.addEventListener('system-restart', handleRestart);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('system-shutdown', handleShutdown);
      window.removeEventListener('system-restart', handleRestart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--glass-opacity', (glassOpacity / 100).toString());
    document.documentElement.style.setProperty('--glass-blur', `${glassBlur}px`);
  }, [accentColor, glassOpacity, glassBlur]);

  return (
    <div className={`w-screen h-screen overflow-hidden ${isDarkMode ? 'dark text-white' : 'text-black'}`}>

      <CustomCursor />

      {!isBooted && !isShutDown && <BootScreen onComplete={() => setIsBooted(true)} />}

      <AnimatePresence>
        {isShutDown && <ShutDownScreen onPowerOn={() => setIsShutDown(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isReady && isBooted && !isShutDown && isLocked && <LockScreen />}
      </AnimatePresence>

      <AnimatePresence>
        {isReady && isBooted && !isShutDown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Desktop>
              <TopBar />
              <WindowManager />
              <WidgetPanel />
              <AiPanel />
              <Taskbar />
            </Desktop>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
