import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ExternalLink, PanelRightClose } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';

const EKA_URL = 'https://abhiraj1121.github.io/ekamini';

const AiPanel = () => {
  const { isAiPanelOpen, setAiPanel } = useOSStore();
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey(k => k + 1);
  };

  return (
    <AnimatePresence>
      {isAiPanelOpen && (
        <>
          <div className="fixed inset-0 z-[6990] md:hidden" onClick={() => setAiPanel(false)} />

          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-2 right-2 bottom-20 w-full max-w-[380px] z-[7000] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">Eka</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">AI Assistant</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReload}
                  title="Reload"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                <a
                  href={EKA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => setAiPanel(false)}
                  title="Close panel"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <PanelRightClose size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-[#141218]">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#141218] z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full"
                  />
                  <div className="text-xs text-white/50">Loading Eka…</div>
                </div>
              )}
              <iframe
                key={reloadKey}
                src={EKA_URL}
                title="Eka AI Assistant"
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                allow="microphone; clipboard-write"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AiPanel;
