import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Home, ChevronLeft, ChevronRight, Bookmark, PlusCircle } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

const BrowserApp = ({ windowId }: { windowId: string }) => {
  const { windows, addWebApp } = useOSStore();
  const currentWindow = windows.find(w => w.id === windowId);

  const [url, setUrl] = useState(currentWindow?.initialUrl || 'https://abhiraj1121.github.io/cognix-studio');
  const [input, setInput] = useState(currentWindow?.initialUrl || 'https://abhiraj1121.github.io/cognix-studio');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = input;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setUrl(finalUrl);
    setInput(finalUrl);
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1e1e1e]">

      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          <button className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => { setUrl(input); setIsLoading(true); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <RotateCw size={14} className={isLoading ? 'animate-spin text-blue-500' : ''} />
          </button>
          <button onClick={() => { setUrl('about:blank'); setInput(''); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Home size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 relative mx-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white dark:bg-[#151515] text-sm text-gray-800 dark:text-gray-200 rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border border-gray-200 dark:border-gray-700"
            placeholder="Search or enter web address"
          />
        </form>

        <button
          onClick={() => {
            const name = prompt('Enter a name for this Web App:');
            if (name) addWebApp(name, url);
          }}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Add as Web App"
        >
          <PlusCircle size={16} />
        </button>
        <button className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Bookmark size={16} />
        </button>
      </div>

      <div className="flex-1 relative bg-white dark:bg-black">
        {url === 'about:blank' || url === '' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8 tracking-widest flex items-center">
              <Search className="mr-3 text-blue-500" size={36} />
              COGNOSearch
            </div>
            <div className="grid grid-cols-4 gap-6 max-w-lg">
              {[
                { n: 'Cognix', u: 'https://abhiraj1121.github.io/cognix-studio' },
                { n: 'Wikipedia', u: 'https://www.wikipedia.org' },
                { n: 'Hacker News', u: 'https://news.ycombinator.com' },
                { n: 'Vite', u: 'https://vitejs.dev' }
              ].map(site => (
                <button
                  key={site.n}
                  onClick={() => { setUrl(site.u); setInput(site.u); setIsLoading(true); }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform border border-transparent group-hover:border-[var(--color-accent)]">
                    {site.n[0]}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">{site.n}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="Browser"
            onLoad={handleLoad}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
};

export default BrowserApp;
