import React, { useEffect, useRef, useState } from 'react';
import { useOSStore } from '../store/useOSStore';

const CustomCursor: React.FC = () => {
  const cursorStyle = useOSStore((s) => s.cursorStyle);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  useEffect(() => {
    if (cursorStyle === 'off') {
      document.documentElement.classList.remove('custom-cursor-active');
      return;
    }

    const touchCheck = window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(touchCheck);
    if (touchCheck) return;

    document.documentElement.classList.add('custom-cursor-active');

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const hoverable = target.closest(
        'button, a, [role="button"], input, textarea, select, .cursor-pointer, [data-cursor="pointer"]'
      );
      setIsPointer(!!hoverable);
    };

    const handleDown = () => setIsDown(true);
    const handleUp = () => setIsDown(false);
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.22;
      ring.current.y += (pos.current.y - ring.current.y) * 0.22;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [isVisible, cursorStyle]);

  if (isTouch || cursorStyle === 'off') return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999]" aria-hidden="true">
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border transition-[width,height,border-color,opacity] duration-150 ease-out"
        style={{
          width: isPointer ? 44 : 28,
          height: isPointer ? 44 : 28,
          borderColor: 'var(--color-accent)',
          opacity: isVisible ? (isPointer ? 0.55 : 0.35) : 0,
          borderWidth: 1.5,
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 rounded-full transition-[width,height,opacity] duration-150 ease-out"
        style={{
          width: isDown ? 8 : isPointer ? 10 : 6,
          height: isDown ? 8 : isPointer ? 10 : 6,
          backgroundColor: 'var(--color-accent)',
          opacity: isVisible ? 1 : 0,
          boxShadow: `0 0 12px 1px var(--color-accent)`,
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default CustomCursor;
