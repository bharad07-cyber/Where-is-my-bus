import { BusStop } from '../types/index.js';

export class GISEngine {
  /**
   * Calculate Haversine distance between two coordinates in meters.
   */
  public static haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate bearing (direction in degrees) from point 1 to point 2.
   */
  public static calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const λ1 = lon1 * (Math.PI / 180);
    const λ2 = lon2 * (Math.PI / 180);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    const bearing = ((θ * (180 / Math.PI)) + 360) % 360;
    return Math.round(bearing * 10) / 10;
  }

  /**
   * Find nearest bus stop within radius.
   */
  public static findNearestStop(lat: number, lng: number, stops: BusStop[], maxRadiusMeters = 5000): { stop: BusStop; distanceMeters: number } | null {
    let nearest: BusStop | null = null;
    let minDistance = Infinity;

    for (const stop of stops) {
      const dist = this.haversineMeters(lat, lng, stop.lat, stop.lng);
      if (dist < minDistance && dist <= maxRadiusMeters) {
        minDistance = dist;
        nearest = stop;
      }
    }

    return nearest ? { stop: nearest, distanceMeters: Math.round(minDistance) } : null;
  }

  /**
   * Find all stops within radius sorted by distance.
   */
  public static findStopsWithinRadius(lat: number, lng: number, stops: BusStop[], radiusMeters = 2000): { stop: BusStop; distanceMeters: number }[] {
    const results: { stop: BusStop; distanceMeters: number }[] = [];

    for (const stop of stops) {
      const dist = this.haversineMeters(lat, lng, stop.lat, stop.lng);
      if (dist <= radiusMeters) {
        results.push({ stop, distanceMeters: Math.round(dist) });
      }
    }

    return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  /**
   * Snap point to nearest segment on a polyline path.
   */
  public static snapToPolyline(lat: number, lng: number, polyline: [number, number][]): { snapped: [number, number]; segmentIndex: number; distanceMeters: number } {
    if (polyline.length === 0) {
      return { snapped: [lat, lng], segmentIndex: 0, distanceMeters: 0 };
    }

    let minDistance = Infinity;
    let bestPoint: [number, number] = polyline[0];
    let bestSegment = 0;

    for (let i = 0; i < polyline.length - 1; i++) {
      const p1 = polyline[i];
      const p2 = polyline[i + 1];

      const proj = this.projectPointToSegment([lat, lng], p1, p2);
      const dist = this.haversineMeters(lat, lng, proj[0], proj[1]);

      if (dist < minDistance) {
        minDistance = dist;
        bestPoint = proj;
        bestSegment = i;
      }
    }

    return { snapped: bestPoint, segmentIndex: bestSegment, distanceMeters: Math.round(minDistance) };
  }

  private static projectPointToSegment(p: [number, number], a: [number, number], b: [number, number]): [number, number] {
    const l2 = Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2);
    if (l2 === 0) return a;
    let t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  }
}
