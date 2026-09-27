import { VehiclePosition } from '../types/index.js';
import { dbStore } from '../database/db.js';
import { GISEngine } from '../gis/gisEngine.js';

export class GTFSRtEngine {
  private static simulationInterval: NodeJS.Timeout | null = null;

  /**
   * Start live GTFS-Realtime simulation & interpolation loop
   */
  public static startLiveStream() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      this.updateVehiclePositions();
    }, 3000); // update every 3 seconds
  }

  private static updateVehiclePositions() {
    const vehicles = dbStore.getVehicles();
    const routes = dbStore.getRoutes();

    for (const v of vehicles) {
      const route = routes.find(r => r.id === v.routeId);
      if (!route || route.polyline.length === 0) continue;

      // Snap current position to route polyline and advance along it
      const snap = GISEngine.snapToPolyline(v.lat, v.lng, route.polyline);
      const nextIndex = (snap.segmentIndex + 1) % route.polyline.length;
      const targetPoint = route.polyline[nextIndex];

      // Move slightly towards target point (smooth interpolation)
      const step = 0.0004; // approx 40 meters
      const dLat = targetPoint[0] - v.lat;
      const dLng = targetPoint[1] - v.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist > 0.0001) {
        v.lat += (dLat / dist) * step;
        v.lng += (dLng / dist) * step;
        v.heading = GISEngine.calculateBearing(v.lat, v.lng, targetPoint[0], targetPoint[1]);
      } else {
        v.lat = targetPoint[0];
        v.lng = targetPoint[1];
      }

      v.lastUpdated = new Date().toISOString();
    }
  }

  public static getLiveVehicles(): VehiclePosition[] {
    return dbStore.getVehicles();
  }
}
