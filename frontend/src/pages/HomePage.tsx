import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { SmartSearchCard } from '../components/SmartSearchCard';
import { LiveMapComponent } from '../maps/LiveMapComponent';
import { LiveJourneyModeCard } from '../components/LiveJourneyModeCard';
import { Bus, MapPin, Sparkles, Navigation, Clock, ShieldCheck, Sun, CloudRain } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language, stops, liveVehicles, activeJourney, setActiveTab } = useAppStore();
  const t = translations[language];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-slate-900 to-sky-900 p-6 sm:p-8 border border-slate-700/60 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MTC & TNSTC Live GTFS Navigation</span>
          </div>

          <h2 className="font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
            {language === 'ta'
              ? 'தமிழ்நாட்டின் மிகச்சிறந்த நேரலை பேருந்து வழிகாட்டி'
              : 'Never Wonder Which Bus to Board in Tamil Nadu'}
          </h2>

          <p className="text-sm text-slate-300">
            Real-time bus tracking, auto vs walk recommendations, bilingual voice guidance, and explainable AI predictions.
          </p>
        </div>

        {/* Smart Search Card */}
        <div className="mt-6 relative z-10">
          <SmartSearchCard />
        </div>
      </div>

      {/* Active Journey Mode Banner (if active) */}
      {activeJourney && <LiveJourneyModeCard />}

      {/* Live Map Preview & Radar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Box */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-4 border border-slate-700/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white">{t.liveBuses}</h3>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Full Screen Map</span>
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full h-80 rounded-xl overflow-hidden">
            <LiveMapComponent />
          </div>
        </div>

        {/* Nearby Bus Stops Board */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>{t.nearbyStops}</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
              GPS Active
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
            {stops.slice(0, 4).map((s) => (
              <div key={s.id} className="bg-slate-900/70 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">{s.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-medium">{s.nameTamil}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">250m</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.routes.map(r => (
                    <span key={r} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                      Bus {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
