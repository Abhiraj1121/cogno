import React, { useState } from 'react';
import { Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShutDownScreenProps {
  onPowerOn: () => void;
}

const ShutDownScreen: React.FC<ShutDownScreenProps> = ({ onPowerOn }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center text-white"
    >
      <button
        onClick={onPowerOn}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
      >
        <div className={`absolute inset-0 rounded-full border border-white/10 transition-transform duration-700 ${isHovered ? 'scale-110 bg-white/5' : 'scale-100'}`} />
        <Power size={40} className={`transition-all duration-500 ${isHovered ? 'text-white' : 'text-gray-600'}`} />
      </button>

      <div className={`mt-8 text-sm font-medium tracking-widest text-gray-500 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        POWER ON
      </div>
    </motion.div>
  );
};

export default ShutDownScreen;
