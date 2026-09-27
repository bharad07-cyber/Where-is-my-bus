import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { History, Leaf, Clock, Award, ShieldCheck } from 'lucide-react';

const analyticsData = [
  { day: 'Mon', minsSaved: 18, co2SavedKg: 1.2 },
  { day: 'Tue', minsSaved: 25, co2SavedKg: 1.8 },
  { day: 'Wed', minsSaved: 30, co2SavedKg: 2.1 },
  { day: 'Thu', minsSaved: 22, co2SavedKg: 1.5 },
  { day: 'Fri', minsSaved: 35, co2SavedKg: 2.4 },
  { day: 'Sat', minsSaved: 12, co2SavedKg: 0.9 },
  { day: 'Sun', minsSaved: 40, co2SavedKg: 2.8 },
];

export const AnalyticsHistoryPage: React.FC = () => {
  const { language } = useAppStore();

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Time Saved</p>
            <p className="font-extrabold text-xl text-white">3.1 Hours</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Carbon Savings</p>
            <p className="font-extrabold text-xl text-white">12.7 kg CO₂</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">ETA Accuracy</p>
            <p className="font-extrabold text-xl text-white">96.4%</p>
          </div>
        </div>
      </div>

      {/* Chart Box */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <History className="w-4 h-4 text-brand-400" />
          <span>Weekly Time Saved via Smart AI Route Planner</span>
        </h3>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="minsSaved" fill="#0284c7" radius={[6, 6, 0, 0]} name="Minutes Saved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
