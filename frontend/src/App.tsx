import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { JourneyPlannerPage } from './pages/JourneyPlannerPage';
import { AnalyticsHistoryPage } from './pages/AnalyticsHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIAssistantModal } from './components/AIAssistantModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { KalmanGPSFilter } from './tracking/kalmanFilter';

const kalmanFilter = new KalmanGPSFilter();

export const App: React.FC = () => {
  const { activeTab, setActiveTab, setStops, setRoutes, setLiveVehicles, setUserLocation, setAIAssistantOpen, setSOSModalOpen } = useAppStore();

  // Load initial bus stops, routes & live vehicles from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stopsRes, routesRes, liveRes] = await Promise.all([
          fetch('/api/stops').then(r => r.json()),
          fetch('/api/routes').then(r => r.json()),
          fetch('/api/live').then(r => r.json())
        ]);

        if (stopsRes.data) setStops(stopsRes.data);
        if (routesRes.data) setRoutes(routesRes.data);
        if (liveRes.data) setLiveVehicles(liveRes.data);
      } catch (err) {
        console.error('API Fetch active');
      }
    };

    fetchData();

    // Poll live vehicle positions every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/live');
        const data = await res.json();
        if (data.data) setLiveVehicles(data.data);
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [setStops, setRoutes, setLiveVehicles]);

  // High-accuracy continuous GPS tracking with Kalman filtering
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const filtered = kalmanFilter.filter(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        setUserLocation({
          lat: filtered.lat,
          lng: filtered.lng,
          accuracyMeters: pos.coords.accuracy,
          heading: pos.coords.heading,
          speedKmh: pos.coords.speed ? pos.coords.speed * 3.6 : 0,
          timestamp: pos.timestamp
        });
      },
      (err) => console.warn('Geolocation warning:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setUserLocation]);

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') setActiveTab('map');
      if (e.key === 'j' || e.key === 'J') setActiveTab('journey');
      if (e.key === 'h' || e.key === 'H') setActiveTab('home');
      if (e.key === 'a' || e.key === 'A') setAIAssistantOpen(true);
      if (e.key === 's' || e.key === 'S') setSOSModalOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, setAIAssistantOpen, setSOSModalOpen]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'map':
        return <MapPage />;
      case 'journey':
        return <JourneyPlannerPage />;
      case 'history':
        return <AnalyticsHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex antialiased selection:bg-brand-500 selection:text-white">
      {/* Desktop Sidebar Layout */}
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden">
          <Navbar />
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      <BottomNavigation />
      <AIAssistantModal />
      <EmergencySOSModal />
    </div>
  );
};

export default App;
