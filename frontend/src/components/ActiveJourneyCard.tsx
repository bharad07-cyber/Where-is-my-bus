import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Navigation, Clock, CheckCircle2, MapPin, ArrowRight, Volume2, X, Play, ShieldCheck, IndianRupee, Bus } from 'lucide-react';
import { speakAnnouncement } from '../utils/voiceGuidance';

export const ActiveJourneyCard: React.FC = () => {
  const { activeJourney, advanceJourneyProgress, endJourney, language } = useAppStore();

  if (!activeJourney) return null;

  const { option, completedStops, currentStopName, nextStopName, remainingStops, progressPercent } = activeJourney;

  const handleAnnounceNextStop = () => {
    const text = language === 'ta'
      ? `அடுத்த நிறுத்தம்: ${nextStopName}. தயவுசெய்து தயார் நிலையில் இருக்கவும்.`
      : `Next stop is ${nextStopName}. Please prepare to get down.`;
    speakAnnouncement(text, language);
  };

  return (
    <div className="glass-card rounded-3xl p-5 border border-sky-500/60 shadow-2xl space-y-4 relative">
      {/* Top Banner: Title & End Journey */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Live Journey Mode Active
            </span>
            <h3 className="font-extrabold text-sm text-white mt-1">
              {option.title}
            </h3>
          </div>
        </div>

        <button
          onClick={endJourney}
          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
          title="End Journey"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Next Stop Announcement Highlight */}
      <div className="bg-gradient-to-r from-sky-900/60 to-brand-900/60 rounded-2xl p-4 border border-sky-500/40 flex items-center justify-between shadow-inner">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">Next Stop Announcement</span>
          <p className="font-extrabold text-base text-emerald-300 flex items-center gap-1.5 mt-0.5">
            <ArrowRight className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>{nextStopName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnnounceNextStop}
            className="p-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition flex items-center gap-1 text-xs font-bold"
            title="Voice Announcement"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Announce</span>
          </button>

          <button
            onClick={advanceJourneyProgress}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-500 hover:from-emerald-500 hover:to-sky-400 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition"
            title="Simulate GPS Moving to Next Stop"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Next Stop</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-slate-300">
          <span>Journey Progress</span>
          <span className="text-sky-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic 4-Stage GTFS Intermediate Stop Sequence Timeline */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
        <p className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
          <Bus className="w-4 h-4 text-sky-400" />
          <span>Live Dynamic GTFS Stop Timeline</span>
        </p>

        <div className="relative pl-6 space-y-3 border-l-2 border-slate-700">
          {/* 1. Completed Stops (Grayed out) */}
          {completedStops.map((stopName, idx) => (
            <div key={`comp_${idx}`} className="relative flex items-center gap-2 text-xs text-slate-500 line-through">
              <div className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-slate-600" />
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>✓ {stopName}</span>
              <span className="text-[10px] font-mono text-slate-600">Passed</span>
            </div>
          ))}

          {/* 2. Current Stop (Highlighted in Vibrant Blue) */}
          <div className="relative flex items-center justify-between text-xs bg-sky-500/20 p-2.5 rounded-xl border border-sky-500/50 shadow-md">
            <div className="absolute -left-[31px] w-3.5 h-3.5 rounded-full bg-sky-400 ring-4 ring-sky-500/30 animate-ping" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-extrabold text-white text-sm">📍 Current Stop: {currentStopName}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500 text-white shadow-sm">
              YOU ARE HERE
            </span>
          </div>

          {/* 3. Next Stop (Highlighted in Electric Green) */}
          <div className="relative flex items-center justify-between text-xs bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/50">
            <div className="absolute -left-[31px] w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-300">➡ Next Stop: {nextStopName}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
              ARRIVING NEXT
            </span>
          </div>

          {/* 4. Remaining Stops (White dot with live ETAs) */}
          {remainingStops.map((stopName, idx) => (
            <div key={`rem_${idx}`} className="relative flex items-center justify-between text-xs text-slate-300">
              <div className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-slate-400" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500">{completedStops.length + idx + 3}.</span>
                <span>○ {stopName}</span>
              </div>
              <span className="text-[11px] font-mono text-sky-400 font-semibold">
                +{ (idx + 2) * 3 } mins
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
