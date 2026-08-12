import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useAnimation, animate } from 'framer-motion';
import { useOSStore, type WindowState } from '../store/useOSStore';

interface WindowContainerProps {
  windowState: WindowState;
  children: React.ReactNode;
}

const WindowContainer: React.FC<WindowContainerProps> = ({ windowState, children }) => {
  const { id, title, x, y, width, height, zIndex, isMinimized, isMaximized, snapState } = windowState;
  const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, updateWindowBounds, activeWindowId } = useOSStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const isActive = activeWindowId === id;

  const getDockOrigin = () => {
    const icon = document.getElementById(`taskbar-icon-${windowState.appId}`);
    const el = containerRef.current;
    if (!icon || !el) return '50% 100%';
    const iconRect = icon.getBoundingClientRect();
    const winRect = el.getBoundingClientRect();
    const originX = ((iconRect.x + iconRect.width / 2 - winRect.x) / winRect.width) * 100;
    const originY = ((iconRect.y + iconRect.height / 2 - winRect.y) / winRect.height) * 100;
    return `${originX}% ${originY}%`;
  };

  const dragX = useMotionValue(x);
  const dragY = useMotionValue(y);

  const controls = useAnimation();
  const [isHidden, setIsHidden] = useState(isMinimized);
  const hasMountedRef = useRef(false);
  const [exitOrigin, setExitOrigin] = useState('50% 100%');

  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    if (isMinimized) return;

    const icon = document.getElementById(`taskbar-icon-${windowState.appId}`);
    if (icon) {
      const rect = icon.getBoundingClientRect();
      const startX = rect.x + rect.width / 2 - width / 2;
      const startY = rect.y + rect.height / 2 - height / 2;
      dragX.set(startX);
      dragY.set(startY);
      controls.set({ scale: 0.1, opacity: 0 });
      animate(dragX, x, { type: 'spring', bounce: 0.15, duration: 0.5 });
      animate(dragY, y, { type: 'spring', bounce: 0.15, duration: 0.5 });
      controls.start({
        width,
        height,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', bounce: 0.15, duration: 0.5 },
      });
    } else {
      dragX.set(x);
      dragY.set(y);
      controls.set({ scale: 0.9, opacity: 0, width, height });
      controls.start({ scale: 1, opacity: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } });
    }
  }, []);

  const skipNextMinimizeEffectRef = useRef(!isMinimized);

  useEffect(() => {
    if (skipNextMinimizeEffectRef.current) {
      skipNextMinimizeEffectRef.current = false;
      return;
    }
    if (isMinimized) {
      const icon = document.getElementById(`taskbar-icon-${windowState.appId}`);
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight;

      if (icon) {
        const rect = icon.getBoundingClientRect();
        targetX = rect.x + rect.width / 2 - (width / 2);
        targetY = rect.y + rect.height / 2 - (height / 2);
      }

      animate(dragX, targetX, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
      animate(dragY, targetY, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
      controls.start({
        scale: 0.05,
        opacity: 0,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      }).then(() => setIsHidden(true));
    } else {
      if (isHidden) {
        setIsHidden(false);
        const icon = document.getElementById(`taskbar-icon-${windowState.appId}`);
        if (icon) {
          const rect = icon.getBoundingClientRect();
          const startX = rect.x + rect.width / 2 - (width / 2);
          const startY = rect.y + rect.height / 2 - (height / 2);
          dragX.set(startX);
          dragY.set(startY);
          controls.set({ scale: 0.05, opacity: 0 });
        }
      }

      animate(dragX, x, { type: 'spring', bounce: 0, duration: 0.4 });
      animate(dragY, y, { type: 'spring', bounce: 0, duration: 0.4 });
      controls.start({
        width,
        height,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', bounce: 0, duration: 0.4 }
      });
    }
  }, [isMinimized, x, y, width, height, isHidden, controls, windowState.appId, dragX, dragY]);

  const handleDragStart = (e: React.PointerEvent) => {
    e.stopPropagation();

    e.target.setPointerCapture(e.pointerId);
    focusWindow(id);

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startDragX = dragX.get();
    const startDragY = dragY.get();

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const newX = startDragX + deltaX;
      let newY = startDragY + deltaY;

      if (newY < 0) newY = 0;

      dragX.set(newX);
      dragY.set(newY);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      upEvent.target?.releasePointerCapture?.(upEvent.pointerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const finalX = dragX.get();
      const finalY = dragY.get();

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const snapThreshold = 40;

      if (upEvent.clientY < snapThreshold) {
        maximizeWindow(id);
      } else if (upEvent.clientX < snapThreshold) {
        updateWindowBounds(id, {
          x: 0, y: 48, width: screenWidth / 2, height: screenHeight - 48
        }, 'left');
      } else if (upEvent.clientX > screenWidth - snapThreshold) {
        updateWindowBounds(id, {
          x: screenWidth / 2, y: 48, width: screenWidth / 2, height: screenHeight - 48
        }, 'right');
      } else {
        updateWindowBounds(id, { x: finalX, y: Math.max(48, finalY) }, 'none');
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 200;

  const renderControls = () => (
    <div className="flex items-center space-x-2 px-3 h-full">
      <button
        className="w-3 h-3 rounded-full bg-red-500 border border-red-600 flex items-center justify-center group"
        onClick={(e) => { e.stopPropagation(); setExitOrigin(getDockOrigin()); closeWindow(id); }}
      >
        <span className="opacity-0 group-hover:opacity-100 text-black text-[8px] font-bold leading-none">✕</span>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600 flex items-center justify-center group"
        onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
      >
        <span className="opacity-0 group-hover:opacity-100 text-black text-[8px] font-bold leading-none">−</span>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-green-500 border border-green-600 flex items-center justify-center group"
        onClick={(e) => {
          e.stopPropagation();
          if (isMaximized) restoreWindow(id);
          else maximizeWindow(id);
        }}
      >
        <span className="opacity-0 group-hover:opacity-100 text-black text-[8px] font-bold leading-none">
          {isMaximized ? '↙' : '↗'}
        </span>
      </button>
    </div>
  );

  const handleResize = (e: React.PointerEvent, edge: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    focusWindow(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    const startWindowX = x;
    const startWindowY = y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startWindowX;
      let newY = startWindowY;

      if (edge.includes('r')) newWidth = Math.max(MIN_WIDTH, startWidth + deltaX);
      if (edge.includes('b')) newHeight = Math.max(MIN_HEIGHT, startHeight + deltaY);
      if (edge.includes('l')) {
        newWidth = Math.max(MIN_WIDTH, startWidth - deltaX);
        if (newWidth > MIN_WIDTH) newX = startWindowX + deltaX;
      }
      if (edge.includes('t')) {
        newHeight = Math.max(MIN_HEIGHT, startHeight - deltaY);
        if (newHeight > MIN_HEIGHT) newY = startWindowY + deltaY;
      }

      updateWindowBounds(id, { x: newX, y: newY, width: newWidth, height: newHeight }, 'none');
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.85, width, height }}
      animate={controls}
      exit={{ opacity: 0, scale: 0.04, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
      style={{
        zIndex,
        position: 'absolute',
        x: dragX,
        y: dragY,
        borderRadius: isMaximized ? '0' : '16px',
        display: isHidden ? 'none' : 'flex',
        transformOrigin: exitOrigin,
      }}
      className={`absolute flex-col bg-glass backdrop-glass overflow-hidden shadow-2xl border ${isActive ? 'border-black/20 dark:border-white/20' : 'border-transparent'}`}
      onPointerDown={() => focusWindow(id)}
    >
      <div
        className={`h-7 flex items-center justify-between select-none touch-none border-b border-black/5 dark:border-white/5 ${isActive ? 'bg-white/40 dark:bg-white/10' : 'bg-white/20 dark:bg-black/20 opacity-80'}`}
        onPointerDown={handleDragStart}
        onDoubleClick={(e) => {
          if (isMaximized) restoreWindow(id);
          else maximizeWindow(id);
        }}
      >
        {renderControls()}
        <div className="flex-1 text-center text-xs font-semibold text-black/70 dark:text-white/70 truncate px-4 pointer-events-none" draggable={false}>
          {title}
        </div>
        <div className="w-16" /> {}
      </div>

      <div className="flex-1 relative overflow-hidden bg-transparent">
        {children}

        {isResizing && <div className="absolute inset-0 z-50 bg-transparent" />}
      </div>

      {!isMaximized && (
        <>
          <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize z-40" onPointerDown={(e) => handleResize(e, 't')} />
          <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize z-40" onPointerDown={(e) => handleResize(e, 'b')} />
          <div className="absolute left-0 top-2 bottom-2 w-1 cursor-e-resize z-40" onPointerDown={(e) => handleResize(e, 'l')} />
          <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize z-40" onPointerDown={(e) => handleResize(e, 'r')} />
          <div className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize z-50" onPointerDown={(e) => handleResize(e, 'tl')} />
          <div className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize z-50" onPointerDown={(e) => handleResize(e, 'tr')} />
          <div className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize z-50" onPointerDown={(e) => handleResize(e, 'bl')} />
          <div className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-50" onPointerDown={(e) => handleResize(e, 'br')} />
        </>
      )}

    </motion.div>
  );
};

export default WindowContainer;
