import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { Home, Map, Navigation, Bot, AlertOctagon } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, language, setAIAssistantOpen, setSOSModalOpen } = useAppStore();
  const t = translations[language];

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'map', label: t.map, icon: Map },
    { id: 'journey', label: t.journey, icon: Navigation },
    { id: 'ai', label: t.aiAssistant, icon: Bot, action: () => setAIAssistantOpen(true) },
    { id: 'emergency', label: t.emergency, icon: AlertOctagon, action: () => setSOSModalOpen(true) }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-card border-t border-slate-700/50 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-sky-400 bg-sky-500/10 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
