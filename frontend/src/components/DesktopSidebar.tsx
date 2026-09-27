import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { Home, Map, Navigation, Search, MapPin, Heart, History, Settings, Bus, Bot, AlertTriangle } from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, language, setAIAssistantOpen, setSOSModalOpen } = useAppStore();
  const t = translations[language];

  const sidebarItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'journey', label: t.journey, icon: Navigation },
    { id: 'map', label: t.map, icon: Map },
    { id: 'history', label: 'History & Stats', icon: History },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass-card border-r border-slate-700/50 p-4 h-screen sticky top-0 shrink-0 space-y-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 border-b border-slate-700/50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Bus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
            {t.appTitle}
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Chennai Transport Guide</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-sky-500 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Action Triggers */}
      <div className="space-y-2 border-t border-slate-700/50 pt-4">
        <button
          onClick={() => setAIAssistantOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Bot className="w-4 h-4 animate-bounce" />
          <span>AI Guide Chat</span>
        </button>

        <button
          onClick={() => setSOSModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Emergency SOS</span>
        </button>
      </div>
    </aside>
  );
};
