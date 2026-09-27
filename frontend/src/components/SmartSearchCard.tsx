import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { translations } from '../i18n/translations';
import { Search, Mic, MapPin, Bus, Navigation, X } from 'lucide-react';

export const SmartSearchCard: React.FC = () => {
  const { language, addRecentSearch, setActiveTab } = useAppStore();
  const t = translations[language];
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sub-50ms autocomplete fetch on typing
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.data) {
          setSuggestions(data.data);
          setIsDropdownOpen(true);
        }
      } catch {}
    }, 20);

    return () => clearTimeout(timer);
  }, [query]);

  const quickTags = [
    { label: 'Bus 23C (Besant Nagar ➔ Ayanavaram)', q: '23C' },
    { label: 'Bus 570 (CMBT ➔ Kelambakkam)', q: '570' },
    { label: 'Bus 88K (Kundrathur ➔ Kodambakkam)', q: '88K' },
    { label: 'Bus 27B (CMBT ➔ Valluvar Kottam)', q: '27B' },
    { label: 'Kodambakkam', q: 'Kodambakkam' },
    { label: 'Valluvar Kottam', q: 'Valluvar Kottam' },
    { label: 'T. Nagar', q: 'T. Nagar' },
    { label: 'Airport', q: 'Airport' },
  ];

  const handleSelectSuggestion = (name: string) => {
    setQuery(name);
    addRecentSearch(name);
    setIsDropdownOpen(false);
    setActiveTab('journey');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addRecentSearch(query);
    setIsDropdownOpen(false);
    setActiveTab('journey');
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 shadow-2xl border border-slate-700/60 relative">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 p-1.5 rounded-xl bg-brand-500/20 text-sky-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder || "Search Bus No (23C, 570, 88K), Stop, Destination..."}
            className="w-full pl-14 pr-24 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition shadow-inner font-medium"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); }}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs transition shadow-md shadow-brand-600/30 flex items-center gap-1"
            >
              <span>Search</span>
              <Navigation className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Instant Google Maps-Grade Autocomplete & Bus Route Search Dropdown */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 glass-card rounded-2xl border border-sky-500/40 shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
            {suggestions.map((item) => (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => handleSelectSuggestion(item.name)}
                className="w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-800/90 flex items-start gap-3 transition"
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${item.type === 'BUS_ROUTE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-sky-400 border-slate-700'}`}>
                  {item.type === 'BUS_ROUTE' ? <Bus className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs text-white flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.busNumber && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                        Bus {item.busNumber}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium">{item.nameTamil}</p>
                  <p className="text-[10px] text-slate-400">{item.subtitle || `Bus Stop in ${item.area}`}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Popular Places & Bus Routes Carousel */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0">Popular Routes:</span>
          {quickTags.map((tag) => (
            <button
              key={tag.q}
              onClick={() => { setQuery(tag.q); addRecentSearch(tag.q); setActiveTab('journey'); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-medium text-slate-200 shrink-0 transition shadow-sm"
            >
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
