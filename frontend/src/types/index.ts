export interface BusStop {
  id: string;
  name: string;
  nameTamil: string;
  lat: number;
  lng: number;
  area: string;
  district: string;
  landmarks: string[];
  wheelchairAccessible: boolean;
  hasShelter: boolean;
  routes: string[];
  popularity: number;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  operator: 'MTC' | 'TNSTC' | 'SETC' | 'TOWN_BUS' | 'MINI_BUS' | 'VILLAGE_BUS';
  origin: string;
  destination: string;
  originTamil: string;
  destinationTamil: string;
  stops: string[];
  polyline: [number, number][];
  avgDurationMins: number;
  fareRs: number;
  frequencyMins: number;
  type: 'EXPRESS' | 'DELUXE' | 'AC_VOLVO' | 'ORDINARY' | 'MINI';
}

export interface VehiclePosition {
  id: string;
  busNumber: string;
  routeId: string;
  operator: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  currentStopId: string;
  nextStopId: string;
  previousStopId: string;
  remainingStopsCount: number;
  delayMins: number;
  occupancy: 'EMPTY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_CROWDED';
  isLive: boolean;
  lastUpdated: string;
}

export interface RouteOption {
  id: string;
  rank: number;
  title: string;
  titleTamil: string;
  totalDurationMins: number;
  totalFareRs: number;
  walkingDistanceMeters: number;
  transfersCount: number;
  isAutoRecommended: boolean;
  autoFareEstimateRs?: number;
  recommendationBadge: 'FASTEST' | 'CHEAPEST' | 'LEAST_WALK' | 'AUTO_HYBRID' | 'BEST_OVERALL';
  recommendationReason: string;
  recommendationReasonTamil: string;
  reliabilityScore: number;
  confidenceScore: number;
  crowdLevel: 'EMPTY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_CROWDED';
  delayRisk: 'ON_TIME' | 'SLIGHT_DELAY' | 'MODERATE_DELAY' | 'HEAVY_DELAY';
  starRating: number;
  aiRecommendationTitle: string;
  stopSequenceDetails: string[];
  steps: RouteStep[];
}

export interface RouteStep {
  type: 'WALK' | 'BUS' | 'AUTO' | 'TRANSFER';
  instruction: string;
  instructionTamil: string;
  distanceMeters: number;
  durationMins: number;
  busNumber?: string;
  routeId?: string;
  boardingStop?: BusStop;
  getOffStop?: BusStop;
  intermediateStopsCount?: number;
  vehiclePosition?: VehiclePosition;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracyMeters: number;
  heading: number | null;
  speedKmh: number | null;
  timestamp: number;
}
