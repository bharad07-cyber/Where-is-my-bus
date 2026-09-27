import { create } from 'zustand';
import { UserLocation, RouteOption, VehiclePosition, BusStop, BusRoute } from '../types';

interface ActiveJourneyState {
  option: RouteOption;
  currentStopIndex: number;
  completedStops: string[];
  currentStopName: string;
  nextStopName: string;
  remainingStops: string[];
  progressPercent: number;
  startTime: number;
}

interface AppStore {
  // Navigation & Theme
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Stops & Routes Cache
  stops: BusStop[];
  setStops: (stops: BusStop[]) => void;
  routes: BusRoute[];
  setRoutes: (routes: BusRoute[]) => void;

  // Modals & Assistant State
  isAIAssistantOpen: boolean;
  setAIAssistantOpen: (open: boolean) => void;
  isSOSModalOpen: boolean;
  setSOSModalOpen: (open: boolean) => void;
  isInsideBus: boolean;
  toggleInsideBus: () => void;
  activeBusVehicle: VehiclePosition | null;

  // Search & Filters
  recentSearches: string[];
  addRecentSearch: (query: string) => void;

  // Live Location & Tracking
  userLocation: UserLocation | null;
  setUserLocation: (loc: UserLocation) => void;
  liveVehicles: VehiclePosition[];
  setLiveVehicles: (vehicles: VehiclePosition[]) => void;
  selectedVehicle: VehiclePosition | null;
  setSelectedVehicle: (vehicle: VehiclePosition | null) => void;

  // Active Journey Tracking State
  activeJourney: ActiveJourneyState | null;
  startJourney: (option: RouteOption) => void;
  advanceJourneyProgress: () => void;
  endJourney: () => void;

  // Preferences & Weather
  weatherCondition: 'CLEAR' | 'RAIN' | 'EXTREME_HEAT';
  setWeatherCondition: (weather: 'CLEAR' | 'RAIN' | 'EXTREME_HEAT') => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeTab: 'map',
  setActiveTab: (tab) => set({ activeTab: tab }),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  darkMode: true,
  setDarkMode: (dark) => set({ darkMode: dark }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark', darkMode: state.theme === 'dark' ? false : true })),

  stops: [],
  setStops: (stops) => set({ stops }),
  routes: [],
  setRoutes: (routes) => set({ routes }),

  isAIAssistantOpen: false,
  setAIAssistantOpen: (open) => set({ isAIAssistantOpen: open }),
  isSOSModalOpen: false,
  setSOSModalOpen: (open) => set({ isSOSModalOpen: open }),
  isInsideBus: false,
  toggleInsideBus: () => set((state) => ({ isInsideBus: !state.isInsideBus })),
  activeBusVehicle: null,

  recentSearches: ['Kodambakkam', 'Valluvar Kottam', 'CMBT Koyambedu', 'T. Nagar', 'Airport'],
  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: Array.from(new Set([query, ...state.recentSearches])).slice(0, 8)
    })),

  userLocation: {
    lat: 13.0514,
    lng: 80.2245,
    accuracyMeters: 8,
    heading: 90,
    speedKmh: 28,
    timestamp: Date.now()
  },
  setUserLocation: (loc) => set({ userLocation: loc }),

  liveVehicles: [],
  setLiveVehicles: (vehicles) => set({ liveVehicles: vehicles }),
  selectedVehicle: null,
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  activeJourney: null,

  startJourney: (option) => {
    const stopsSeq = option.stopSequenceDetails && option.stopSequenceDetails.length > 0
      ? option.stopSequenceDetails
      : [
          option.steps[0]?.boardingStop?.name || 'Boarding Stop',
          ...option.steps.filter(s => s.getOffStop).map(s => s.getOffStop!.name)
        ];

    const currentStopName = stopsSeq[0] || 'Origin Stop';
    const nextStopName = stopsSeq[1] || 'Destination';
    const remainingStops = stopsSeq.slice(2);

    set({
      activeJourney: {
        option,
        currentStopIndex: 0,
        completedStops: [],
        currentStopName,
        nextStopName,
        remainingStops,
        progressPercent: 5,
        startTime: Date.now()
      },
      activeTab: 'map'
    });
  },

  advanceJourneyProgress: () => {
    const current = get().activeJourney;
    if (!current) return;

    const stopsSeq = current.option.stopSequenceDetails && current.option.stopSequenceDetails.length > 0
      ? current.option.stopSequenceDetails
      : ['Origin Stop', 'Destination'];

    const nextIndex = current.currentStopIndex + 1;
    if (nextIndex >= stopsSeq.length) {
      set({
        activeJourney: {
          ...current,
          currentStopIndex: stopsSeq.length - 1,
          completedStops: stopsSeq.slice(0, stopsSeq.length - 1),
          currentStopName: stopsSeq[stopsSeq.length - 1],
          nextStopName: 'Destination Reached',
          remainingStops: [],
          progressPercent: 100
        }
      });
      return;
    }

    const completedStops = stopsSeq.slice(0, nextIndex);
    const currentStopName = stopsSeq[nextIndex];
    const nextStopName = stopsSeq[nextIndex + 1] || 'Destination';
    const remainingStops = stopsSeq.slice(nextIndex + 2);
    const progressPercent = Math.round(((nextIndex + 1) / stopsSeq.length) * 100);

    set({
      activeJourney: {
        ...current,
        currentStopIndex: nextIndex,
        completedStops,
        currentStopName,
        nextStopName,
        remainingStops,
        progressPercent
      }
    });
  },

  endJourney: () => set({ activeJourney: null }),

  weatherCondition: 'CLEAR',
  setWeatherCondition: (weather) => set({ weatherCondition: weather })
}));
