import React, { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { speakAnnouncement } from '../utils/voiceGuidance';
import { Bus, Navigation, Clock, Volume2, X, Play } from 'lucide-react';

export const LiveJourneyModeCard: React.FC = () => {
  const { activeJourney, isInsideBus, toggleInsideBus, language, advanceJourneyProgress, endJourney } = useAppStore();

  const currentStopName = activeJourney ? activeJourney.currentStopName : 'VADAPALANI DEPOT';
  const nextStopName = activeJourney ? activeJourney.nextStopName : 'ASHOK PILLAR';
  const remainingStopsCount = activeJourney ? (activeJourney.remainingStops.length + 1) : 4;
  const progressPercent = activeJourney ? activeJourney.progressPercent : 35;
  const estimatedEtaMins = activeJourney ? Math.max(5, remainingStopsCount * 3) : 18;

  const handleVoiceAnnouncement = () => {
    const text = language === 'ta'
      ? `அடுத்த நிறுத்தம்: ${nextStopName}. ${remainingStopsCount} நிறுத்தங்கள் மீதமுள்ளன.`
      : `Next stop is ${nextStopName}. ${remainingStopsCount} stops remaining. ETA ${estimatedEtaMins} minutes.`;
    speakAnnouncement(text, language);
  };

  useEffect(() => {
    if (isInsideBus) {
      handleVoiceAnnouncement();
    }
  }, [nextStopName, isInsideBus]);

  return (
    <div className="w-full glass-card rounded-3xl p-5 border border-slate-700/80 shadow-2xl relative overflow-hidden bg-slate-900/95 space-y-4">
      {/* Top Bar: Ready to Board + I Am Inside This Bus Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isInsideBus ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          <span className={`font-black text-xs tracking-wider uppercase ${isInsideBus ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isInsideBus ? 'LIVE TRACKING ACTIVE' : 'READY TO BOARD'}
          </span>
        </div>

        <button
          onClick={toggleInsideBus}
          className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition shadow-lg ${
            isInsideBus
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>{isInsideBus ? 'INSIDE BUS ACTIVE' : 'I AM INSIDE THIS BUS'}</span>
        </button>
      </div>

      {/* Main Cards: Auto Detected Stop & Next Stop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Auto Detected Stop */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-inner">
          <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mb-1">
            AUTO DETECTED STOP
          </p>
          <p className="font-black text-sm text-sky-400 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{currentStopName}</span>
          </p>
        </div>

        {/* Next Stop */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-inner">
          <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mb-1">
            NEXT STOP
          </p>
          <p className="font-black text-sm text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{nextStopName}</span>
          </p>
        </div>
      </div>

      {/* Progress & Remaining Counter */}
      <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-white">{remainingStopsCount} Stops Remaining</span>
          <span className="text-emerald-400 font-mono">ETA: {estimatedEtaMins} mins</span>
        </div>

        <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-sky-400 via-brand-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleVoiceAnnouncement}
          className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
        >
          <Volume2 className="w-4 h-4 text-sky-400" />
          <span>Voice Announcement</span>
        </button>

        {activeJourney && (
          <button
            onClick={advanceJourneyProgress}
            className="py-3 px-4 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-black text-xs border border-sky-500/40 flex items-center justify-center gap-1 transition"
            title="Simulate Next Stop Movement"
          >
            <Play className="w-3.5 h-3.5 fill-sky-400" />
            <span>Next</span>
          </button>
        )}

        <button
          onClick={endJourney}
          className="py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-extrabold text-xs border border-rose-500/40 transition shrink-0"
        >
          Exit Journey
        </button>
      </div>
    </div>
  );
};
