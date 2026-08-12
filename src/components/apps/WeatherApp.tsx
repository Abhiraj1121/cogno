import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSun } from 'lucide-react';
const CITIES = ['San Francisco', 'New York', 'London', 'Tokyo', 'Mumbai'];
const ICONS = [Sun, CloudSun, Cloud, CloudRain];
const seeded = (s: string) => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
const WeatherApp = () => {
  const [city, setCity] = useState(CITIES[0]);
  const seed = seeded(city);
  const Icon = ICONS[seed % ICONS.length];
  const temp = 10 + (seed % 25);
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-sky-400 to-blue-600 text-white p-5">
      <select value={city} onChange={e => setCity(e.target.value)} className="bg-white/20 rounded-lg px-3 py-1.5 text-sm outline-none self-start backdrop-blur">
        {CITIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
      </select>
      <div className="flex-1 flex flex-col items-center justify-center">
        <Icon size={80} strokeWidth={1} />
        <div className="text-6xl font-thin mt-2">{temp}°</div>
        <div className="text-white/80 mt-1">{city}</div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {['Mon', 'Tue', 'Wed', 'Thu'].map((d, i) => (
          <div key={d} className="bg-white/10 rounded-xl p-2 backdrop-blur">
            <div>{d}</div>
            <div className="font-semibold mt-1">{temp + i - 2}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default WeatherApp;
