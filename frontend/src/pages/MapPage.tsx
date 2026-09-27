import React from 'react';
import { LiveMapComponent } from '../maps/LiveMapComponent';
import { LiveJourneyModeCard } from '../components/LiveJourneyModeCard';
import { useAppStore } from '../stores/useAppStore';
import { Compass, Locate, Layers, ShieldCheck } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { activeJourney, userLocation, setUserLocation } = useAppStore();

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          heading: pos.coords.heading,
          speedKmh: pos.coords.speed ? pos.coords.speed * 3.6 : 0,
          timestamp: pos.timestamp
        });
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-130px)] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl">
      <LiveMapComponent />

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-3 rounded-2xl glass-card text-sky-400 hover:text-white border border-slate-700 shadow-xl transition active:scale-95"
          title="Recenter GPS"
        >
          <Locate className="w-5 h-5" />
        </button>

        <button
          className="p-3 rounded-2xl glass-card text-slate-300 hover:text-white border border-slate-700 shadow-xl transition"
          title="Map Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Active Journey Card Drawer (if journey active) */}
      {activeJourney && (
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-lg mx-auto">
          <LiveJourneyModeCard />
        </div>
      )}
    </div>
  );
};
