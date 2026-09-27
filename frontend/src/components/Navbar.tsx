import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { Bus, Moon, Sun, Languages, AlertTriangle, Bot } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, setAIAssistantOpen, setSOSModalOpen } = useAppStore();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-700/50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button */}
          <button
            onClick={() => setAIAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 text-xs font-semibold transition"
          >
            <Bot className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">AI Guide</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={() => setSOSModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold transition animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Languages className="w-4 h-4 text-brand-400" />
            <span>{t.languageToggle}</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
