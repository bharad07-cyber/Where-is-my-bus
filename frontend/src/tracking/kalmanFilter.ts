/**
 * 2D Kalman Filter for smooth GPS coordinate tracking without flickering or jumping.
 */
export class KalmanGPSFilter {
  private Q: number; // Process noise covariance
  private R: number; // Measurement noise covariance
  private P_lat: number;
  private P_lng: number;
  private lat: number | null = null;
  private lng: number | null = null;

  constructor(processNoise = 0.00001, measurementNoise = 0.0001) {
    this.Q = processNoise;
    this.R = measurementNoise;
    this.P_lat = 1.0;
    this.P_lng = 1.0;
  }

  public filter(rawLat: number, rawLng: number, accuracyMeters = 10): { lat: number; lng: number } {
    if (this.lat === null || this.lng === null) {
      this.lat = rawLat;
      this.lng = rawLng;
      return { lat: rawLat, lng: rawLng };
    }

    // Dynamic measurement noise scaling based on reported GPS accuracy
    const rScaled = this.R * (accuracyMeters / 10);

    // Predict step
    this.P_lat = this.P_lat + this.Q;
    this.P_lng = this.P_lng + this.Q;

    // Kalman Gain calculation
    const K_lat = this.P_lat / (this.P_lat + rScaled);
    const K_lng = this.P_lng / (this.P_lng + rScaled);

    // Update state estimate
    this.lat = this.lat + K_lat * (rawLat - this.lat);
    this.lng = this.lng + K_lng * (rawLng - this.lng);

    // Update error covariance
    this.P_lat = (1 - K_lat) * this.P_lat;
    this.P_lng = (1 - K_lng) * this.P_lng;

    return {
      lat: Math.round(this.lat * 1000000) / 1000000,
      lng: Math.round(this.lng * 1000000) / 1000000
    };
  }
}
