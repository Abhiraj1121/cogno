import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SnapState = 'none' | 'left' | 'right' | 'full';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  snapState: SnapState;
  preSnapBounds?: Bounds;
  initialUrl?: string;
}

interface WebApp {
  id: string;
  name: string;
  url: string;
}

interface OSStore {
  windows: WindowState[];
  activeWindowId: string | null;
  highestZIndex: number;

  isDarkMode: boolean;
  accentColor: string;
  glassOpacity: number;
  glassBlur: number;
  systemSoundEnabled: boolean;
  wallpaper: string;
  isWidgetPanelOpen: boolean;
  isAiPanelOpen: boolean;
  webApps: WebApp[];
  password?: string;
  username: string;
  isLocked: boolean;
  dockPosition: 'bottom' | 'left' | 'right';
  dockSize: 'small' | 'medium' | 'large';
  cursorStyle: 'default' | 'off';

  setDarkMode: (isDark: boolean) => void;
  setAccentColor: (color: string) => void;
  setGlassOpacity: (opacity: number) => void;
  setGlassBlur: (blur: number) => void;
  setSystemSoundEnabled: (enabled: boolean) => void;
  setWallpaper: (url: string) => void;
  toggleWidgetPanel: () => void;
  setWidgetPanel: (isOpen: boolean) => void;
  toggleAiPanel: () => void;
  setAiPanel: (isOpen: boolean) => void;
  addWebApp: (name: string, url: string) => void;
  setPassword: (password?: string) => void;
  setUsername: (username: string) => void;
  setIsLocked: (isLocked: boolean) => void;
  setDockPosition: (position: 'bottom' | 'left' | 'right') => void;
  setDockSize: (size: 'small' | 'medium' | 'large') => void;
  setCursorStyle: (style: 'default' | 'off') => void;

  openWindow: (appId: string, title: string, initialUrl?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: Partial<Bounds>, snapState?: SnapState) => void;
  toggleMinimize: (appId: string) => void;
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 500;

export const useOSStore = create<OSStore>()(
  persist(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      highestZIndex: 100,

  isDarkMode: false,
  accentColor: '#3b82f6',
  glassOpacity: 70,
  glassBlur: 24,
  systemSoundEnabled: true,
  wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  isWidgetPanelOpen: false,
  isAiPanelOpen: false,
  webApps: [],
  password: '',
  username: 'cogno-user',
  isLocked: true,
  dockPosition: 'bottom',
  dockSize: 'medium',
  cursorStyle: 'default',

  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setAccentColor: (color) => set({ accentColor: color }),
  setGlassOpacity: (opacity) => set({ glassOpacity: opacity }),
  setGlassBlur: (blur) => set({ glassBlur: blur }),
  setSystemSoundEnabled: (enabled) => set({ systemSoundEnabled: enabled }),
  setWallpaper: (url) => set({ wallpaper: url }),
  toggleWidgetPanel: () => set((state) => ({
    isWidgetPanelOpen: !state.isWidgetPanelOpen
  })),
  setWidgetPanel: (isOpen) => set({ isWidgetPanelOpen: isOpen }),
  toggleAiPanel: () => set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
  setAiPanel: (isOpen) => set({ isAiPanelOpen: isOpen }),
  addWebApp: (name, url) => set((state) => {
    const newWebApp = { id: `webapp-${crypto.randomUUID()}`, name, url };
    return { webApps: [...state.webApps, newWebApp] };
  }),
  setPassword: (password) => set({ password }),
  setUsername: (username) => set({ username: username.trim() || 'cogno-user' }),
  setIsLocked: (isLocked) => set({ isLocked }),
  setDockPosition: (position) => set({ dockPosition: position }),
  setDockSize: (size) => set({ dockSize: size }),
  setCursorStyle: (style) => set({ cursorStyle: style }),

  openWindow: (appId, title, initialUrl) => {
    const { windows, highestZIndex } = get();
    const existingWindow = windows.find(w => w.appId === appId);

    if (existingWindow) {
      if (existingWindow.isMinimized) {
        set(state => ({
          windows: state.windows.map(w =>
            w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 } : w
          ),
          activeWindowId: existingWindow.id,
          highestZIndex: state.highestZIndex + 1,
        }));
      } else {
        get().focusWindow(existingWindow.id);
      }
      return;
    }

    const cascadeOffset = (windows.length % 10) * 30;
    const initialX = Math.max(100, (window.innerWidth - DEFAULT_WIDTH) / 2) + cascadeOffset;
    const initialY = Math.max(100, (window.innerHeight - DEFAULT_HEIGHT) / 2) + cascadeOffset;

    const isMobile = window.innerWidth < 768;

    const newWindow: WindowState = {
      id: crypto.randomUUID(),
      appId,
      title,
      x: isMobile ? 0 : initialX,
      y: isMobile ? 48 : initialY,
      width: isMobile ? window.innerWidth : DEFAULT_WIDTH,
      height: isMobile ? window.innerHeight - 48 : DEFAULT_HEIGHT,
      zIndex: highestZIndex + 1,
      isMinimized: false,
      isMaximized: isMobile,
      snapState: isMobile ? 'full' : 'none',
      initialUrl,
    };

    set(state => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      highestZIndex: state.highestZIndex + 1,
    }));
  },

  closeWindow: (id) => {
    set(state => {
      const newWindows = state.windows.filter(w => w.id !== id);
      const newActiveId = state.activeWindowId === id
        ? (newWindows.length > 0 ? [...newWindows].sort((a, b) => b.zIndex - a.zIndex)[0].id : null)
        : state.activeWindowId;
      return { windows: newWindows, activeWindowId: newActiveId };
    });
  },

  minimizeWindow: (id) => {
    set(state => {
      const newWindows = state.windows.map(w => w.id === id ? { ...w, isMinimized: true } : w);
      const newActiveId = state.activeWindowId === id
        ? (newWindows.filter(w => !w.isMinimized).length > 0 ? [...newWindows.filter(w => !w.isMinimized)].sort((a, b) => b.zIndex - a.zIndex)[0].id : null)
        : state.activeWindowId;
      return { windows: newWindows, activeWindowId: newActiveId };
    });
  },

  maximizeWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== id) return w;
        if (w.isMaximized) return w;
        return {
          ...w,
          isMaximized: true,
          snapState: 'full',
          preSnapBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 48,
          width: window.innerWidth,
          height: window.innerHeight - 48,
          zIndex: state.highestZIndex + 1
        };
      }),
      activeWindowId: id,
      highestZIndex: state.highestZIndex + 1,
    }));
  },

  restoreWindow: (id) => {
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== id) return w;
        if (!w.preSnapBounds) return { ...w, isMaximized: false, snapState: 'none' };
        return {
          ...w,
          isMaximized: false,
          snapState: 'none',
          x: w.preSnapBounds.x,
          y: w.preSnapBounds.y,
          width: w.preSnapBounds.width,
          height: w.preSnapBounds.height,
          zIndex: state.highestZIndex + 1
        };
      }),
      activeWindowId: id,
      highestZIndex: state.highestZIndex + 1,
    }));
  },

  focusWindow: (id) => {
    const { activeWindowId } = get();
    if (activeWindowId === id) return;

    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, zIndex: state.highestZIndex + 1 } : w
      ),
      activeWindowId: id,
      highestZIndex: state.highestZIndex + 1,
    }));
  },

  updateWindowBounds: (id, bounds, snapState = 'none') => {
    set(state => ({
      windows: state.windows.map(w => {
        if (w.id !== id) return w;

        const preSnap = (w.snapState !== 'none' && snapState === 'none') ? undefined : w.preSnapBounds;

        let newPreSnap = preSnap;
        if (w.snapState === 'none' && snapState !== 'none' && !w.preSnapBounds) {
          newPreSnap = { x: w.x, y: w.y, width: w.width, height: w.height };
        }

        return {
          ...w,
          ...bounds,
          snapState,
          isMaximized: snapState === 'full',
          preSnapBounds: newPreSnap !== undefined ? newPreSnap : w.preSnapBounds,
        };
      })
    }));
  },

  toggleMinimize: (appId) => {
    const { windows, activeWindowId } = get();
    const win = windows.find(w => w.appId === appId);
    if (!win) {
      get().openWindow(appId, appId);
      return;
    }

    if (win.isMinimized) {
      set(state => ({
        windows: state.windows.map(w => w.id === win.id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 } : w),
        activeWindowId: win.id,
        highestZIndex: state.highestZIndex + 1,
      }));
    } else if (activeWindowId === win.id) {
      get().minimizeWindow(win.id);
    } else {
      get().focusWindow(win.id);
    }
  }
}),
{
  name: 'cogno-os-storage',
  partialize: (state) => ({
    isDarkMode: state.isDarkMode,
    accentColor: state.accentColor,
    glassOpacity: state.glassOpacity,
    glassBlur: state.glassBlur,
    systemSoundEnabled: state.systemSoundEnabled,
    wallpaper: state.wallpaper,
    webApps: state.webApps,
    password: state.password,
    username: state.username,
    dockPosition: state.dockPosition,
    dockSize: state.dockSize,
    cursorStyle: state.cursorStyle,
  })
}));
