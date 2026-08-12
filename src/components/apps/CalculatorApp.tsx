import React, { useState, useEffect } from 'react';
import { Delete, Divide, X, Minus, Plus, Equal } from 'lucide-react';

const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op}`);
    setShouldResetDisplay(true);
  };

  const handleCalculate = () => {
    if (!equation) return;

    try {
      const evalEq = equation.replace('×', '*').replace('÷', '/') + ' ' + display;

      const result = eval(evalEq);
      const resultStr = String(result);

      setDisplay(resultStr);
      setHistory([`${evalEq} = ${resultStr}`, ...history].slice(0, 5));
      setEquation('');
      setShouldResetDisplay(true);
    } catch (e) {
      setDisplay('Error');
      setShouldResetDisplay(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    if (shouldResetDisplay) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) handleNumber(key);
      if (key === '+' || key === '-') handleOperator(key);
      if (key === '*') handleOperator('×');
      if (key === '/') handleOperator('÷');
      if (key === 'Enter' || key === '=') handleCalculate();
      if (key === 'Escape') handleClear();
      if (key === 'Backspace') handleDelete();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex flex-col h-full w-full bg-transparent p-4">

      <div className="flex-1 overflow-y-auto mb-4 flex flex-col justify-end text-right">
        {history.map((h, i) => (
          <div key={i} className="text-gray-400 text-sm mb-1">{h}</div>
        ))}
      </div>

      <div className="mb-4 text-right">
        <div className="text-gray-500 h-6 text-sm">{equation}</div>
        <div className="text-5xl font-light text-gray-800 dark:text-gray-100 truncate">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={handleClear} className="col-span-2 p-4 bg-gray-200 dark:bg-gray-800 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">AC</button>
        <button onClick={handleDelete} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl flex justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"><Delete size={20} /></button>
        <button onClick={() => handleOperator('÷')} className="p-4 bg-[var(--color-accent)] text-white rounded-xl flex justify-center hover:opacity-90 transition-opacity"><Divide size={20} /></button>

        {[7, 8, 9].map(n => (
          <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/20 transition-colors font-medium">{n}</button>
        ))}
        <button onClick={() => handleOperator('×')} className="p-4 bg-[var(--color-accent)] text-white rounded-xl flex justify-center hover:opacity-90 transition-opacity"><X size={20} /></button>

        {[4, 5, 6].map(n => (
          <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/20 transition-colors font-medium">{n}</button>
        ))}
        <button onClick={() => handleOperator('-')} className="p-4 bg-[var(--color-accent)] text-white rounded-xl flex justify-center hover:opacity-90 transition-opacity"><Minus size={20} /></button>

        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/20 transition-colors font-medium">{n}</button>
        ))}
        <button onClick={() => handleOperator('+')} className="p-4 bg-[var(--color-accent)] text-white rounded-xl flex justify-center hover:opacity-90 transition-opacity"><Plus size={20} /></button>

        <button onClick={() => handleNumber('0')} className="col-span-2 p-4 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/20 transition-colors font-medium">0</button>
        <button onClick={() => handleNumber('.')} className="p-4 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/20 transition-colors font-medium">.</button>
        <button onClick={handleCalculate} className="p-4 bg-[var(--color-accent)] text-white rounded-xl flex justify-center hover:opacity-90 transition-opacity"><Equal size={20} /></button>
      </div>
    </div>
  );
};

export default CalculatorApp;
