import React, { useState } from 'react';
import { useFileStore } from '../../store/useFileStore';
import { useOSStore } from '../../store/useOSStore';

const SettingsApp = () => {
  const { resetDB, files, createFile } = useFileStore();
  const {
    isDarkMode, setDarkMode, accentColor, setAccentColor, setWallpaper,
    dockPosition, setDockPosition, dockSize, setDockSize, cursorStyle, setCursorStyle,
    username, setUsername, password, setPassword,
  } = useOSStore();
  const [nameInput, setNameInput] = useState(username);
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const savePassword = () => {
    if (password) {
      if (curPass !== password) { setPassMsg('Incorrect current password'); return; }
    }
    setPassword(newPass);
    setCurPass(''); setNewPass('');
    setPassMsg(newPass ? 'Password updated' : 'Password removed');
    setTimeout(() => setPassMsg(''), 2000);
  };

  const handleCustomWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setWallpaper(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  const exportVFS = () => {
    const data = JSON.stringify(files);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cogno_os_vfs_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importVFS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        for (const key in imported) {
          if (imported[key].id) {
             await createFile(imported[key]);
          }
        }
        alert('Import successful!');
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  const wallpapers = [
    { name: 'Abstract Blue', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Mountain Night', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Minimalist Sand', url: 'https://images.unsplash.com/photo-1503149779833-1de50ebe5f8a?q=80&w=2500&auto=format&fit=crop' },
    { name: 'Ocean View', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Neon City', url: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Geometric', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Red Mars', url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Aerial Coast', url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2564&auto=format&fit=crop' },
  ];

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#22c55e' },
  ];

  const totalFiles = Object.keys(files).length;
  const storageUsage = Math.min(100, Math.max(2, (totalFiles / 100) * 100));

  return (
    <div className="p-6 h-full overflow-y-auto bg-transparent text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-8 max-w-2xl">

        <section className="bg-white/50 dark:bg-[#252525]/50 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>

          <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Toggle system theme</div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Toggle
            </button>
          </div>

          <div className="py-3">
            <div className="font-medium mb-3">Accent Color</div>
            <div className="flex space-x-3 mb-6">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : ''}`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>

            <div className="font-medium mb-2 mt-4">Glass Transparency</div>
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="range"
                min="10" max="100"
                value={useOSStore.getState().glassOpacity}
                onChange={(e) => useOSStore.getState().setGlassOpacity(parseInt(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
              <span className="text-sm font-mono text-gray-500 w-12 text-right">{useOSStore.getState().glassOpacity}%</span>
            </div>

            <div className="font-medium mb-2 mt-4">Glass Blur Intensity</div>
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="range"
                min="0" max="64"
                value={useOSStore.getState().glassBlur}
                onChange={(e) => useOSStore.getState().setGlassBlur(parseInt(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
              <span className="text-sm font-mono text-gray-500 w-12 text-right">{useOSStore.getState().glassBlur}px</span>
            </div>

            <div className="flex items-center justify-between py-3 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div>
                <div className="font-medium">System UI Sounds</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Play audio for actions (clicks, notifications)</div>
              </div>
              <button
                onClick={() => useOSStore.getState().setSystemSoundEnabled(!useOSStore.getState().systemSoundEnabled)}
                className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${useOSStore.getState().systemSoundEnabled ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                {useOSStore.getState().systemSoundEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white/50 dark:bg-[#252525]/50 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Desktop Background</h2>
            <label className="px-3 py-1.5 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-colors cursor-pointer text-sm font-medium shadow-sm">
              Upload Custom
              <input type="file" className="hidden" accept="image/*" onChange={handleCustomWallpaper} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {wallpapers.map((wp, i) => (
              <div key={i} className="flex flex-col items-center">
                <button
                  onClick={() => setWallpaper(wp.url)}
                  className="w-full h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--color-accent)] transition-colors mb-2"
                >
                  <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-400">{wp.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/50 dark:bg-[#252525]/50 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Dock & Cursor</h2>

          <div className="py-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="font-medium mb-2">Dock Position</div>
            <div className="flex space-x-2">
              {(['bottom', 'left', 'right'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => setDockPosition(pos)}
                  className={`px-4 py-1.5 rounded-lg capitalize transition-colors font-medium text-sm ${dockPosition === pos ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="py-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="font-medium mb-2 mt-2">Dock Icon Size</div>
            <div className="flex space-x-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setDockSize(size)}
                  className={`px-4 py-1.5 rounded-lg capitalize transition-colors font-medium text-sm ${dockSize === size ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 mt-2">
            <div>
              <div className="font-medium">Custom Cursor</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Themed pointer with hover effects</div>
            </div>
            <button
              onClick={() => setCursorStyle(cursorStyle === 'off' ? 'default' : 'off')}
              className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${cursorStyle === 'default' ? 'bg-[var(--color-accent)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              {cursorStyle === 'default' ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </section>

        <section className="bg-white/50 dark:bg-[#252525]/50 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Account</h2>

          <div className="py-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="font-medium mb-2">Display Name</div>
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="cogno-user"
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={() => setUsername(nameInput)}
                className="px-4 py-1.5 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>

          <div className="py-3">
            <div className="font-medium mb-1">{password ? 'Change Password' : 'Set Password'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {password ? 'Used to unlock your session' : 'No password set — lock screen is open'}
            </div>
            <div className="flex flex-col gap-2">
              {password && (
                <input
                  type="password"
                  value={curPass}
                  onChange={(e) => setCurPass(e.target.value)}
                  placeholder="Current password"
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none"
                />
              )}
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder={password ? 'New password (blank to remove)' : 'New password'}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none"
                />
                <button
                  onClick={savePassword}
                  className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Update
                </button>
              </div>
              {passMsg && <div className="text-xs text-[var(--color-accent)]">{passMsg}</div>}
            </div>
          </div>
        </section>

        <section className="bg-white/50 dark:bg-[#252525]/50 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Security</h2>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium">Lock Screen</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Manage your password above in the Account section
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/50 dark:bg-[#252525]/50 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Storage & Data</h2>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">IndexedDB VFS</span>
              <span className="text-gray-500">{totalFiles} files</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] transition-all duration-1000" style={{ width: `${storageUsage}%` }} />
            </div>
          </div>

          <div className="flex space-x-3 mb-6">
            <button onClick={exportVFS} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm text-sm">
              Export VFS
            </button>
            <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm cursor-pointer text-sm">
              Import VFS
              <input type="file" className="hidden" accept=".json" onChange={importVFS} />
            </label>
          </div>

          <div className="h-px w-full bg-gray-200/50 dark:bg-gray-700/50 mb-4" />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-red-500">Reset All Local Data</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Clears IndexedDB VFS and reloads OS</div>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure? This will delete all files and reset the OS.')) {
                  await resetDB();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
            >
              Reset Data
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsApp;
