import React, { useState, useRef, useEffect } from 'react';
import { useFileStore } from '../../store/useFileStore';
import { useOSStore } from '../../store/useOSStore';

const ALL_COMMANDS = [
  'help', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'rm', 'clear',
  'date', 'pwd', 'whoami', 'neofetch', 'open', 'theme', 'history',
  'uname', 'ps', 'uptime', 'man', 'sudo', 'grep', 'find', 'cp', 'mv',
  'df', 'top', 'exit', 'hostname', 'env', 'which', 'cowsay',
];

const BOOT_TIME = Date.now();

const TerminalApp = () => {
  const { files, createFile, deleteFile, updateFile } = useFileStore();
  const { openWindow, setDarkMode, isDarkMode, accentColor } = useOSStore();
  const [history, setHistory] = useState<{ command: string, output: string | React.ReactNode }[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>(['desktop']);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getPathString = () => {
    if (currentPath.length === 0) return '/';
    return '/' + currentPath.map(id => files[id]?.name || 'unknown').join('/');
  };

  const getShortPath = () => {
    if (currentPath.length === 0) return '~';
    const last = files[currentPath[currentPath.length - 1]];
    return last ? `~/${last.name}` : '~';
  };

  const getCurrentFolderId = () => {
    return currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
  };

  const findNodeByName = (name: string, parentId: string | null) => {
    return Object.values(files).find(f => f.name === name && f.parentId === parentId);
  };

  const formatUptime = () => {
    const secs = Math.floor((Date.now() - BOOT_TIME) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `up ${m}m ${s}s`;
  };

  const renderPrompt = (pathStr: string) => (
    <span className="whitespace-nowrap">
      <span className="text-emerald-400 font-semibold">cogno-user@cogno-os</span>
      <span className="text-gray-400">:</span>
      <span className="text-sky-400 font-semibold">{pathStr}</span>
      <span className="text-gray-300">$</span>
    </span>
  );

  const handleTabComplete = () => {
    const args = input.split(' ');
    const last = args[args.length - 1];
    if (args.length === 1) {
      const matches = ALL_COMMANDS.filter(c => c.startsWith(last));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setHistory(prev => [...prev, {
          command: `${getShortPath()} $ ${input}`,
          output: matches.join('  '),
        }]);
      }
    } else {
      const parentId = getCurrentFolderId();
      const children = Object.values(files).filter(f => f.parentId === parentId);
      const matches = children.filter(f => f.name.startsWith(last)).map(f => f.name);
      if (matches.length === 1) {
        args[args.length - 1] = matches[0];
        setInput(args.join(' '));
      } else if (matches.length > 1) {
        setHistory(prev => [...prev, {
          command: `${getShortPath()} $ ${input}`,
          output: matches.join('  '),
        }]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = historyIndex === null ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(cmdHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= cmdHistory.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[nextIndex]);
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setHistory(prev => [...prev, { command: `${getShortPath()} $ ${input}^C`, output: '' }]);
      setInput('');
      setHistoryIndex(null);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const args = input.trim().split(' ').filter(Boolean);
    const cmd = args[0].toLowerCase();
    let output: string | React.ReactNode = '';

    setCmdHistory(prev => [...prev, input]);
    setHistoryIndex(null);

    try {
      const parentId = getCurrentFolderId();

      switch (cmd) {
        case 'help':
          output = (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-gray-300">
              {ALL_COMMANDS.map(c => <span key={c} className="text-emerald-400">{c}</span>)}
            </div>
          );
          break;
        case 'whoami':
          output = 'cogno-user';
          break;
        case 'hostname':
          output = 'cogno-os';
          break;
        case 'uname':
          output = args[1] === '-a'
            ? 'Cogno 6.5.0-cogno #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
            : 'Cogno';
          break;
        case 'uptime':
          output = `${new Date().toLocaleTimeString()} ${formatUptime()}, 1 user, load average: 0.12, 0.08, 0.05`;
          break;
        case 'env':
          output = (
            <div className="text-gray-300">
              SHELL=/bin/cogno-sh<br />
              USER=cogno-user<br />
              HOME=/desktop<br />
              LANG=en_US.UTF-8<br />
              TERM=xterm-256color
            </div>
          );
          break;
        case 'which':
          output = args[1] ? (ALL_COMMANDS.includes(args[1]) ? `/usr/bin/${args[1]}` : `which: no ${args[1]} in PATH`) : '';
          break;
        case 'ps':
          output = (
            <pre className="text-gray-300">{`  PID TTY          TIME CMD
    1 pts/0    00:00:00 cogno-sh
   42 pts/0    00:00:00 window-mgr
   84 pts/0    00:00:00 terminal`}</pre>
          );
          break;
        case 'top':
          output = (
            <pre className="text-gray-300">{`Tasks: ${3 + Object.keys(files).length} total,  1 running
%Cpu(s): ${(Math.random() * 15 + 2).toFixed(1)} us,  ${(Math.random() * 5).toFixed(1)} sy
MiB Mem :  ${(Math.random() * 2000 + 4000).toFixed(0)} used`}</pre>
          );
          break;
        case 'df':
          output = (
            <pre className="text-gray-300">{`Filesystem     Size  Used Avail Use% Mounted on
/dev/vfs0       64G   ${(Object.keys(files).length * 0.01).toFixed(1)}G   ${(64 - Object.keys(files).length * 0.01).toFixed(1)}G   1% /`}</pre>
          );
          break;
        case 'man':
          if (!args[1]) {
            output = 'What manual page do you want?';
          } else if (ALL_COMMANDS.includes(args[1])) {
            output = (
              <div className="text-gray-300">
                <div className="text-emerald-400 font-bold">NAME</div>
                <div className="pl-4 mb-2">{args[1]} - Cogno OS shell command</div>
                <div className="text-emerald-400 font-bold">SYNOPSIS</div>
                <div className="pl-4">{args[1]} [arguments]</div>
              </div>
            );
          } else {
            output = `No manual entry for ${args[1]}`;
          }
          break;
        case 'sudo':
          output = 'cogno-user is not in the sudoers file. This incident will be reported.';
          break;
        case 'cowsay': {
          const msg = args.slice(1).join(' ') || 'Moo!';
          const bar = '-'.repeat(msg.length + 2);
          output = (
            <pre className="text-gray-300">{` ${bar}
< ${msg} >
 ${bar}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}</pre>
          );
          break;
        }
        case 'history':
          output = (
            <div className="text-gray-300">
              {cmdHistory.map((h, i) => <div key={i}>{i + 1}  {h}</div>)}
            </div>
          );
          break;
        case 'grep': {
          if (args.length < 3) { output = 'Usage: grep <pattern> <file>'; break; }
          const pattern = args[1];
          const file = findNodeByName(args[2], parentId);
          if (!file || file.type !== 'file') { output = `grep: ${args[2]}: No such file`; break; }
          const lines = (file.content || '').split('\n').filter(l => l.includes(pattern));
          output = lines.length > 0
            ? <div className="text-gray-300">{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
            : '';
          break;
        }
        case 'find': {
          const term = args[1] || '';
          const matches = Object.values(files).filter(f => f.name.includes(term));
          output = matches.length > 0
            ? <div className="text-gray-300">{matches.map(f => <div key={f.id}>./{f.name}</div>)}</div>
            : 'No matches found';
          break;
        }
        case 'cp': {
          if (args.length < 3) { output = 'Usage: cp <source> <dest>'; break; }
          const src = findNodeByName(args[1], parentId);
          if (!src) { output = `cp: cannot stat '${args[1]}': No such file`; break; }
          if (findNodeByName(args[2], parentId)) { output = `cp: '${args[2]}' already exists`; break; }
          await createFile({ name: args[2], type: src.type, parentId, content: src.content });
          break;
        }
        case 'mv': {
          if (args.length < 3) { output = 'Usage: mv <source> <dest>'; break; }
          const src = findNodeByName(args[1], parentId);
          if (!src) { output = `mv: cannot stat '${args[1]}': No such file`; break; }
          await updateFile(src.id, { name: args[2] });
          break;
        }
        case 'neofetch':
          output = (
            <div className="flex gap-4">
              <div style={{ color: accentColor }} className="font-bold">
                <pre>
                  {`   /\\   `}
                  <br />
                  {`  /  \\  `}
                  <br />
                  {` /____\\ `}
                </pre>
              </div>
              <div>
                <span className="text-white font-bold">cogno-user</span>@<span className="text-white font-bold">cogno-os</span><br/>
                -------------------------<br/>
                <span className="text-blue-400">OS:</span> Cogno OS v2.0<br/>
                <span className="text-blue-400">Host:</span> Browser<br/>
                <span className="text-blue-400">Kernel:</span> React-DOM 19<br/>
                <span className="text-blue-400">Uptime:</span> {formatUptime()}<br/>
                <span className="text-blue-400">Shell:</span> cogno-sh<br/>
                <span className="text-blue-400">Theme:</span> {isDarkMode ? 'Dark' : 'Light'}<br/>
                <span className="text-blue-400">Files:</span> {Object.keys(files).length}<br/>
              </div>
            </div>
          );
          break;
        case 'theme':
          if (args[1] === 'dark') {
            setDarkMode(true);
            output = 'Theme set to dark mode.';
          } else if (args[1] === 'light') {
            setDarkMode(false);
            output = 'Theme set to light mode.';
          } else {
            output = 'Usage: theme <dark|light>';
          }
          break;
        case 'open':
          if (!args[1]) {
            output = 'Usage: open <appId>\nAvailable apps: browser, files, editor, settings, calculator, about';
          } else {
            openWindow(args[1], args[1].charAt(0).toUpperCase() + args[1].slice(1));
            output = `Opening ${args[1]}...`;
          }
          break;
        case 'date':
          output = new Date().toString();
          break;
        case 'pwd':
          output = getPathString();
          break;
        case 'exit':
          output = 'logout';
          break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        case 'ls': {
          const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
          const children = Object.values(files).filter(f => f.parentId === parentId);
          output = (
            <div className="flex gap-4 flex-wrap">
              {showAll && <><span className="text-blue-400 font-bold">.</span><span className="text-blue-400 font-bold">..</span></>}
              {children.map(c => (
                <span key={c.id} className={c.type === 'folder' ? 'text-blue-400 font-bold' : 'text-gray-200'}>
                  {c.name}{c.type === 'folder' ? '/' : ''}
                </span>
              ))}
            </div>
          );
          if (children.length === 0 && !showAll) output = '';
          break;
        }
        case 'cd': {
          const target = args[1];
          if (!target || target === '~') {
            setCurrentPath(['desktop']);
          } else if (target === '..') {
            if (currentPath.length > 0) {
              setCurrentPath(prev => prev.slice(0, -1));
            }
          } else {
            const folder = findNodeByName(target, parentId);
            if (folder && folder.type === 'folder') {
              setCurrentPath([...currentPath, folder.id]);
            } else {
              output = `cd: ${target}: No such directory`;
            }
          }
          break;
        }
        case 'mkdir':
          if (!args[1]) {
            output = 'mkdir: missing operand';
          } else {
            if (findNodeByName(args[1], parentId)) {
              output = `mkdir: cannot create directory '${args[1]}': File exists`;
            } else {
              await createFile({ name: args[1], type: 'folder', parentId });
            }
          }
          break;
        case 'touch':
          if (!args[1]) {
            output = 'touch: missing operand';
          } else {
            if (!findNodeByName(args[1], parentId)) {
              await createFile({ name: args[1], type: 'file', parentId, content: '' });
            }
          }
          break;
        case 'cat':
          if (!args[1]) {
            output = 'cat: missing operand';
          } else {
            const file = findNodeByName(args[1], parentId);
            if (file) {
              if (file.type === 'folder') {
                output = `cat: ${args[1]}: Is a directory`;
              } else {
                output = file.content || '';
              }
            } else {
              output = `cat: ${args[1]}: No such file or directory`;
            }
          }
          break;
        case 'echo': {
          const textIndex = input.indexOf(args[1]);
          const text = input.slice(textIndex);
          if (text.includes('>')) {
            const parts = text.split('>');
            const contentText = parts[0].trim().replace(/^['"]|['"]$/g, '');
            const targetFile = parts[parts.length - 1].trim();
            const append = text.includes('>>');

            const file = findNodeByName(targetFile, parentId);
            if (file) {
              if (file.type === 'folder') {
                output = `echo: ${targetFile}: Is a directory`;
              } else {
                await updateFile(file.id, { content: append ? (file.content || '') + contentText + '\n' : contentText });
              }
            } else {
              await createFile({ name: targetFile, type: 'file', parentId, content: contentText });
            }
          } else {
            output = args.slice(1).join(' ').replace(/^['"]|['"]$/g, '');
          }
          break;
        }
        case 'rm':
          if (!args[1]) {
            output = 'rm: missing operand';
          } else {
            const file = findNodeByName(args[1], parentId);
            if (file) {
              await deleteFile(file.id);
            } else {
              output = `rm: cannot remove '${args[1]}': No such file or directory`;
            }
          }
          break;
        default:
          output = `cogno-sh: command not found: ${cmd}`;
      }
    } catch (err: any) {
      output = `Error: ${err.message}`;
    }

    setHistory(prev => [...prev, { command: `${getShortPath()} $ ${input}`, output }]);
    setInput('');
  };

  return (
    <div
      ref={scrollRef}
      className="w-full h-full bg-[#0c0c0c]/90 text-gray-200 font-mono p-3 overflow-y-auto text-[13px] cursor-text leading-relaxed"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mb-2 text-gray-500">Cogno OS Terminal — cogno-sh 2.0.0 (type 'help' for commands)</div>

      {history.map((entry, i) => (
        <div key={i} className="mb-1.5 whitespace-pre-wrap break-words">
          <div>{entry.command}</div>
          {entry.output !== '' && <div className="mt-0.5">{entry.output}</div>}
        </div>
      ))}

      <form onSubmit={handleCommand} className="flex items-center">
        {renderPrompt(getShortPath())}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setHistoryIndex(null); }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-gray-100 ml-2 caret-emerald-400"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalApp;
