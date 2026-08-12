import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { useFileStore } from '../store/useFileStore';

interface DesktopProps {
  children: React.ReactNode;
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const { wallpaper, openWindow } = useOSStore();
  const { addFile } = useFileStore();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (const file of Array.from(e.dataTransfer.files)) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            addFile({
              name: file.name,
              type: 'image',
              content: e.target?.result as string,
              parentId: 'root'
            });
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('text/')) {
          const text = await file.text();
          addFile({
            name: file.name,
            type: 'text',
            content: text,
            parentId: 'root'
          });
        }
      }
    }
  };

  return (
    <div
      className="relative w-full h-full bg-cover bg-center overflow-hidden transition-all duration-500"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none transition-colors duration-500" />

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-blue-500/20 border-4 border-blue-500/50 backdrop-blur-sm m-4 rounded-3xl flex items-center justify-center pointer-events-none"
          >
            <div className="text-3xl font-bold text-white drop-shadow-lg bg-black/40 px-8 py-4 rounded-full">
              Drop files to save to Desktop
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col pointer-events-auto">
        {children}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-[1000] min-w-[200px] bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-2xl rounded-xl border border-white/20 dark:border-white/10 py-1 overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => {
                openWindow('files', 'File Manager');
                setContextMenu(null);
              }}
            >
              Open File Manager
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => {
                openWindow('settings', 'Settings');
                setContextMenu(null);
              }}
            >
              Change Wallpaper
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Desktop;
