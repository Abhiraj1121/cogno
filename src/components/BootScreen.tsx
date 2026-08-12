import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon } from 'lucide-react';

type LogStatus = 'ok' | 'fail' | null;

interface BootLog {
  text: string;
  status?: LogStatus;
}

const bootLogs: BootLog[] = [
  { text: '[    0.000000] Linux version 6.5.0-cogno (root@build-server) (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC' },
  { text: '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.5.0-cogno root=UUID=8a2b quiet splash' },
  { text: '[    0.012345] BIOS-provided physical RAM map: usable' },
  { text: '[    0.054321] DMI: Cognix Studio System 1.0, BIOS 1.0.0 01/01/2026' },
  { text: '[    0.100123] smpboot: CPU0: Cognix Neural Engine M1 (family: 0x6, model: 0x9e)' },
  { text: 'Checking TSC synchronization', status: 'ok' },
  { text: '[    0.205432] Mount-cache hash table entries: 131072 (order: 8, 1048576 bytes)' },
  { text: '[    0.312345] PCI: Using configuration type 1 for base access' },
  { text: 'Initializing GPU compositor', status: 'ok' },
  { text: '[    0.501234] VFS: Disk quotas cgqfmt_v2, cciss, reiserfs' },
  { text: 'Generating entropy pool', status: 'ok' },
  { text: '[    0.723456] EXT4-fs (sda1): mounted filesystem with ordered data mode' },
  { text: 'Starting systemd-udevd', status: 'ok' },
  { text: '[    0.912345] systemd[1]: Starting Journal Service...' },
  { text: 'Mounting /home', status: 'ok' },
  { text: 'Probing network interface eth0', status: 'fail' },
  { text: 'Falling back to loopback', status: 'ok' },
  { text: '[    1.412345] Cogno OS Initialization Script version 2.0 starting' },
  { text: 'Loading Virtual File System from IndexedDB', status: 'ok' },
  { text: 'Verifying filesystem integrity', status: 'ok' },
  { text: 'Starting Window Manager (framer-motion backend)', status: 'ok' },
  { text: 'Loading personalization preferences', status: 'ok' },
  { text: 'Initializing Desktop Environment', status: 'ok' },
  { text: 'System Ready', status: 'ok' },
];

const StatusTag = ({ status }: { status: LogStatus }) => {
  if (status === 'ok') return <span className="text-emerald-400 font-bold">[  OK  ]</span>;
  if (status === 'fail') return <span className="text-red-400 font-bold">[FAILED]</span>;
  return null;
};

const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<BootLog[]>([]);
  const [phase, setPhase] = useState<'logs' | 'logo' | 'done'>('logs');
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;

    const logInterval = setInterval(() => {
      if (currentIndex < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentIndex]]);
        currentIndex++;
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(logInterval);
        setTimeout(() => setPhase('logo'), 350);
      }
    }, 45);

    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    if (phase === 'logo') {
      let p = 0;
      const progInterval = setInterval(() => {
        p += Math.random() * 18 + 6;
        if (p >= 100) {
          p = 100;
          clearInterval(progInterval);
        }
        setProgress(p);
      }, 140);

      const finishTimer = setTimeout(() => {
        setPhase('done');
        setTimeout(onComplete, 700);
      }, 2200);

      return () => {
        clearInterval(progInterval);
        clearTimeout(finishTimer);
      };
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-black text-white font-mono text-xs overflow-hidden"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 2px, #fff 3px)',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

          <AnimatePresence mode="wait">
            {phase === 'logs' ? (
              <motion.div
                key="logs"
                ref={containerRef}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-4 overflow-hidden flex flex-col justify-end space-y-0.5"
              >
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 0.9, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-baseline gap-2 whitespace-pre"
                  >
                    <StatusTag status={log?.status ?? null} />
                    <span className={log?.status ? 'text-gray-300' : 'text-gray-500'}>{log?.text}</span>
                  </motion.div>
                ))}
                <div className="flex items-center gap-1 pt-1">
                  <span className="text-emerald-400">_</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-3 bg-emerald-400 inline-block"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-black flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-24 h-24 mb-10 text-white flex items-center justify-center"
                >
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.15, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
                  />
                  <Hexagon size={80} fill="currentColor" strokeWidth={1} className="relative" />
                </motion.div>

                <div className="w-52 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mt-4 text-[11px] tracking-[0.3em] uppercase text-white/60"
                >
                  Cogno OS
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
