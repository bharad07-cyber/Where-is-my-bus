import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { VoiceGuidanceService } from '../voice/voiceGuidance';
import { Settings, Moon, Sun, Languages, Volume2, Navigation, HardDrive, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme } = useAppStore();
  const t = translations[language];

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
          <Settings className="w-5 h-5 text-sky-400" />
          <h2 className="font-extrabold text-base text-white">Application Settings</h2>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-brand-400 border border-slate-700">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Language / மொழி</p>
              <p className="text-[11px] text-slate-400">Switch UI and Voice Guidance Language</p>
            </div>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-extrabold text-xs border border-slate-700 transition"
          >
            {language === 'en' ? 'தமிழ் (Tamil)' : 'English'}
          </button>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-xs text-white">Theme</p>
              <p className="text-[11px] text-slate-400">Light / Dark Glassmorphism Mode</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 transition"
          >
            {theme === 'dark' ? t.darkMode : t.lightMode}
          </button>
        </div>

        {/* Voice Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Voice Guidance</p>
              <p className="text-[11px] text-slate-400">Announce turn-by-turn & destination arrival alerts</p>
            </div>
          </div>
          <button
            onClick={() => VoiceGuidanceService.speak('Voice navigation is active.', language)}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold text-xs border border-emerald-500/40 hover:bg-emerald-600/30 transition"
          >
            Test Voice
          </button>
        </div>

        {/* Offline Cache Manager */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Offline PWA Storage</p>
              <p className="text-[11px] text-slate-400">Cached Map Tiles, Stops & Routes for offline use</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">14.2 MB Cached</span>
        </div>
      </div>
    </div>
  );
};
