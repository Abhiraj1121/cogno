import React, { useEffect, useState } from 'react';
import { Hexagon, Cpu, HardDrive, Monitor, Globe } from 'lucide-react';

const AboutApp = () => {
  const [ip, setIp] = useState('Loading…');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setIp(d.ip))
      .catch(() => setIp('Unavailable'));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent p-8 text-gray-800 dark:text-gray-200">

      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 shadow-blue-500/20">
        <Hexagon size={48} className="text-white" fill="currentColor" />
      </div>

      <h1 className="text-3xl font-bold mb-1 tracking-tight">Cogno OS</h1>
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">Version 1.0.0 (Build 2026)</div>

      <div className="w-full max-w-md bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6 space-y-4">

        <div className="flex items-center space-x-4">
          <Cpu className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Processor</div>
            <div className="text-sm font-medium">Cognix Neural Engine M1</div>
          </div>
        </div>

        <div className="h-px w-full bg-black/5 dark:bg-white/5" />

        <div className="flex items-center space-x-4">
          <HardDrive className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Memory</div>
            <div className="text-sm font-medium">16 GB Unified RAM</div>
          </div>
        </div>

        <div className="h-px w-full bg-black/5 dark:bg-white/5" />

        <div className="flex items-center space-x-4">
          <Monitor className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Graphics</div>
            <div className="text-sm font-medium">Built-in Liquid Retina</div>
          </div>
        </div>

        <div className="h-px w-full bg-black/5 dark:bg-white/5" />

        <div className="flex items-center space-x-4">
          <Globe className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Your IP Address</div>
            <div className="text-sm font-medium font-mono">{ip}</div>
          </div>
        </div>

      </div>

      <div className="mt-8 text-xs text-gray-400 dark:text-gray-500">
        &copy; 2026 Cognix Studio. All rights reserved.
      </div>
    </div>
  );
};

export default AboutApp;
