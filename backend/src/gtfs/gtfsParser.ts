import { BusStop, BusRoute } from '../types/index.js';
import { dbStore } from '../database/db.js';

export interface GTFSStopTime {
  tripId: string;
  stopId: string;
  stopSequence: number;
  arrivalTime: string;
  departureTime: string;
}

export class GTFSParser {
  /**
   * Check if a route contains origin_stop before dest_stop in its GTFS stop sequence graph.
   */
  public static isDirectGTFSMatch(route: BusRoute, originStopId: string, destStopId: string): { matches: boolean; intermediateCount: number; stopSequence: string[] } {
    const originIdx = route.stops.indexOf(originStopId);
    const destIdx = route.stops.indexOf(destStopId);

    if (originIdx !== -1 && destIdx !== -1 && originIdx < destIdx) {
      const stopSeq = route.stops.slice(originIdx, destIdx + 1);
      return {
        matches: true,
        intermediateCount: destIdx - originIdx,
        stopSequence: stopSeq
      };
    }

    return { matches: false, intermediateCount: 0, stopSequence: [] };
  }

  public static getStops(): BusStop[] {
    return dbStore.getStops();
  }

  public static getRoutes(): BusRoute[] {
    return dbStore.getRoutes();
  }
}
