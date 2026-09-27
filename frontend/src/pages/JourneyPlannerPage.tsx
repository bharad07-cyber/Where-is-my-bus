import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { RouteOption } from '../types';
import { RouteComparisonCard } from '../components/RouteComparisonCard';
import { Navigation, MapPin, ArrowRightLeft, Sparkles, Sun, CloudRain, Flame, Locate, AlertTriangle } from 'lucide-react';

export const JourneyPlannerPage: React.FC = () => {
  const { userLocation, weatherCondition, setWeatherCondition, startJourney } = useAppStore();

  // Origin & Destination State
  const [originName, setOriginName] = useState('Broadway Bus Terminus');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0878, lng: 80.2835 });
  const [destName, setDestName] = useState('Thiruvanmiyur Bus Depot');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9830, lng: 80.2594 });

  // Autocomplete Suggestions
  const [originQuery, setOriginQuery] = useState('Broadway Bus Terminus');
  const [destQuery, setDestQuery] = useState('Thiruvanmiyur Bus Depot');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [routesOptions, setRoutesOptions] = useState<RouteOption[]>([]);
  const [noRouteMessage, setNoRouteMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Search Origin Autocomplete
  useEffect(() => {
    if (!originQuery.trim() || originQuery === originName) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(originQuery)}`);
        const data = await res.json();
        if (data.data) {
          setOriginSuggestions(data.data);
          setShowOriginDropdown(true);
        }
      } catch {}
    }, 50);
    return () => clearTimeout(timer);
  }, [originQuery, originName]);

  // Search Destination Autocomplete
  useEffect(() => {
    if (!destQuery.trim() || destQuery === destName) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(destQuery)}`);
        const data = await res.json();
        if (data.data) {
          setDestSuggestions(data.data);
          setShowDestDropdown(true);
        }
      } catch {}
    }, 50);
    return () => clearTimeout(timer);
  }, [destQuery, destName]);

  // Plan Journey Call (Discovers up to 10 GTFS Graph Routes)
  const fetchPlannedRoutes = async () => {
    setLoading(true);
    setNoRouteMessage(null);
    try {
      const res = await fetch('/api/journey/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: originCoords.lat,
          originLng: originCoords.lng,
          destLat: destCoords.lat,
          destLng: destCoords.lng,
          weatherCondition
        })
      });
      const data = await res.json();

      if (data.noRouteAvailable) {
        setRoutesOptions([]);
        setNoRouteMessage(data.message || 'No public bus route is available for this journey.');
      } else if (data.options && data.options.length > 0) {
        setRoutesOptions(data.options);
      } else {
        setRoutesOptions([]);
        setNoRouteMessage('No public bus route is available for this journey.');
      }
    } catch {
      setNoRouteMessage('No public bus route is available for this journey.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedRoutes();
  }, [originCoords, destCoords, weatherCondition]);

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setOriginName('Current GPS Location');
      setOriginQuery('Current GPS Location');
      setOriginCoords({ lat: userLocation.lat, lng: userLocation.lng });
    }
  };

  const handleSwap = () => {
    const tempName = originName;
    const tempCoords = originCoords;
    setOriginName(destName);
    setOriginQuery(destName);
    setOriginCoords(destCoords);

    setDestName(tempName);
    setDestQuery(tempName);
    setDestCoords(tempCoords);
  };

  const handleSelectQuickPair = (oName: string, oLat: number, oLng: number, dName: string, dLat: number, dLng: number) => {
    setOriginName(oName);
    setOriginQuery(oName);
    setOriginCoords({ lat: oLat, lng: oLng });

    setDestName(dName);
    setDestQuery(dName);
    setDestCoords({ lat: dLat, lng: dLng });
    setShowOriginDropdown(false);
    setShowDestDropdown(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      {/* Interactive Inputs Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-700/60 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Multi-Route GTFS Graph Engine</h2>
              <p className="text-[11px] text-slate-400">Discovering up to 10 Ranked Journey Options with ML Predictions</p>
            </div>
          </div>

          {/* Weather Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setWeatherCondition('CLEAR')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition ${weatherCondition === 'CLEAR' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400'}`}
              title="Clear Weather"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={() => setWeatherCondition('RAIN')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition ${weatherCondition === 'RAIN' ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400'}`}
              title="Rain Warning"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rain</span>
            </button>
            <button
              onClick={() => setWeatherCondition('EXTREME_HEAT')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition ${weatherCondition === 'EXTREME_HEAT' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-400'}`}
              title="Extreme Heat"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Heat</span>
            </button>
          </div>
        </div>

        {/* Inputs Grid with Swap Button */}
        <div className="relative space-y-3">
          {/* Origin Input */}
          <div className="relative">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={originQuery}
                onChange={(e) => setOriginQuery(e.target.value)}
                onFocus={() => setShowOriginDropdown(true)}
                placeholder="Starting Location (Broadway, T. Nagar, Island Ground, Kundrathur...)"
                className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="absolute right-2 px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-[11px] font-semibold border border-sky-500/40 flex items-center gap-1 transition"
              >
                <Locate className="w-3 h-3" />
                <span>GPS</span>
              </button>
            </div>

            {/* Origin Suggestions Dropdown */}
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 glass-card rounded-2xl border border-sky-500/40 shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                {originSuggestions.map((item) => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => {
                      setOriginName(item.name);
                      setOriginQuery(item.name);
                      setOriginCoords({ lat: item.lat, lng: item.lng });
                      setShowOriginDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 border-b border-slate-800 hover:bg-slate-800/80 flex items-start gap-2 transition text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.area}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwap}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 shadow-md transition transform hover:rotate-180 duration-300 z-10"
              title="Swap Origin & Destination"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="relative">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-4 h-4 text-rose-400" />
              <input
                type="text"
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                onFocus={() => setShowDestDropdown(true)}
                placeholder="Destination (Thiruvanmiyur, Kilambakkam, Besant Nagar, Ayanavaram...)"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Destination Suggestions Dropdown */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 glass-card rounded-2xl border border-sky-500/40 shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                {destSuggestions.map((item) => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => {
                      setDestName(item.name);
                      setDestQuery(item.name);
                      setDestCoords({ lat: item.lat, lng: item.lng });
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 border-b border-slate-800 hover:bg-slate-800/80 flex items-start gap-2 transition text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.area}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Official Route Presets */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Test Official MTC Chennai Routes:</p>
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            <button onClick={() => handleSelectQuickPair('Broadway Bus Terminus', 13.0878, 80.2835, 'Thiruvanmiyur Bus Depot', 12.9830, 80.2594)} className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 shrink-0 font-bold">
              Bus 1: Broadway ➔ Thiruvanmiyur
            </button>
            <button onClick={() => handleSelectQuickPair('Island Ground / Anna Square', 13.0722, 80.2800, 'Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)', 12.8342, 80.0768)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 21G: Island Ground ➔ Kilambakkam
            </button>
            <button onClick={() => handleSelectQuickPair('Royapuram Bus Stand', 13.1112, 80.2925, 'Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)', 12.8342, 80.0768)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 18A: Royapuram ➔ Kilambakkam
            </button>
            <button onClick={() => handleSelectQuickPair('Besant Nagar Bus Depot', 13.0003, 80.2667, 'Ayanavaram Bus Depot', 13.0985, 80.2385)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 23C: Besant Nagar ➔ Ayanavaram
            </button>
            <button onClick={() => handleSelectQuickPair('Island Ground / Anna Square', 13.0722, 80.2800, 'Poonamallee Bus Terminus', 13.0485, 80.0912)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 25: Anna Sq ➔ Poonamallee
            </button>
            <button onClick={() => handleSelectQuickPair('T. Nagar Bus Terminus', 13.0418, 80.2341, 'Siruseri IT Park', 12.8285, 80.2185)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 19A: T. Nagar ➔ Siruseri IT
            </button>
            <button onClick={() => handleSelectQuickPair('Kundrathur Bus Stand', 12.9978, 80.0972, 'Kodambakkam Bus Stop', 13.0514, 80.2245)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 88K: Kundrathur ➔ Kodambakkam
            </button>
            <button onClick={() => handleSelectQuickPair('CMBT Koyambedu Bus Terminus', 13.0694, 80.1948, 'Island Ground / Anna Square', 13.0722, 80.2800)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 27B: CMBT ➔ Anna Square
            </button>
            <button onClick={() => handleSelectQuickPair('Perambur Bus Stand', 13.1095, 80.2485, 'Besant Nagar Bus Depot', 13.0003, 80.2667)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 29C: Perambur ➔ Besant Nagar
            </button>
            <button onClick={() => handleSelectQuickPair('Island Ground / Anna Square', 13.0722, 80.2800, 'Ennore Bus Stand', 13.2145, 80.3210)} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 font-medium">
              Bus 4: Island Ground ➔ Ennore
            </button>
          </div>
        </div>

        <button
          onClick={fetchPlannedRoutes}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-brand-600/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Traverse Transit Graph & Discover All Routes</span>
        </button>
      </div>

      {/* Recommended Route Options List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-200 tracking-wide uppercase">
            Discovered Journey Options ({routesOptions.length})
          </h3>
          <span className="text-xs text-sky-400 font-bold bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">
            ML Ranked
          </span>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs animate-pulse">
            Traversing GTFS graph across all transit corridors & ranking options with ML models...
          </div>
        ) : noRouteMessage ? (
          <div className="glass-card rounded-2xl p-6 border border-amber-500/40 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="font-extrabold text-white text-base">No Direct GTFS Route Available</h4>
            <p className="text-xs text-slate-300 font-medium">{noRouteMessage}</p>
          </div>
        ) : (
          routesOptions.map((option) => (
            <RouteComparisonCard
              key={option.id}
              option={option}
              onSelect={(opt) => startJourney(opt)}
            />
          ))
        )}
      </div>
    </div>
  );
};
