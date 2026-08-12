import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, ArrowRight, User } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
let isFirstLockScreenMount = true;

const LockScreen = () => {
  const { password, username, setIsLocked } = useOSStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    isFirstLockScreenMount = false;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPrompt) {
        setShowPrompt(true);
      } else if (e.key === 'Escape') {
        setShowPrompt(false);
        setInput('');
        setError(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      if (input.trim()) {
        useOSStore.getState().setPassword(input.trim());
        setIsLocked(false);
      } else {
        setError(true);
        setTimeout(() => setError(false), 500);
      }
    } else {
      if (input === password) {
        setIsLocked(false);
      } else {
        setError(true);
        setInput('');
        setTimeout(() => setError(false), 500);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div 
      initial={isFirstLockScreenMount ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center text-white cursor-default select-none overflow-hidden"
      onClick={() => {
        if (!showPrompt) setShowPrompt(true);
      }}
    >
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-[-1] bg-black/40 backdrop-blur-3xl">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_60%)] animate-pulse" />
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(147,51,234,0.2),transparent_50%)] animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.2),transparent_50%)] animate-[spin_25s_linear_infinite]" />
      </div>

      <AnimatePresence mode="wait">
        {!showPrompt ? (
          <motion.div 
            key="clock"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="text-[120px] font-semibold leading-none tracking-tight mb-2">
              {formatTime(time)}
            </div>
            <div className="text-2xl font-medium opacity-80">
              {formatDate(time)}
            </div>
            <div className="mt-16 text-sm opacity-50 animate-pulse">
              Press any key or click to {password ? 'unlock' : 'setup password'}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="prompt"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-2xl mb-6 border-2 border-white/20"
            >
              <User size={48} className="text-white/80" />
            </motion.div>
            
            <h1 className="text-2xl font-bold mb-8">
              {password ? username : 'Welcome to Cogno OS'}
            </h1>
            
            <form onSubmit={handleSubmit} className="relative group">
              <motion.input 
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={password ? "Enter Password" : "Create a Password"}
                animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className={`w-64 bg-white/10 border ${error ? 'border-red-500' : 'border-white/20 group-hover:border-white/40'} text-white placeholder-white/50 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors duration-300 text-center tracking-widest`}
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            </form>
            
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-red-400 text-xs mt-4"
                >
                  {password ? 'Incorrect password.' : 'Password cannot be empty.'}
                </motion.p>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-white/40 text-xs mt-4"
                >
                  {password ? 'Press Esc to cancel' : 'Please set a password to continue'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 flex flex-col items-center opacity-50">
        <Hexagon size={24} className="mb-2" />
        <span className="text-xs tracking-widest font-semibold uppercase">Cogno OS</span>
      </div>
    </motion.div>
  );
};

export default LockScreen;
