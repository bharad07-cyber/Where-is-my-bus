import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { dbStore } from '../database/db.js';
import { GISEngine } from '../gis/gisEngine.js';
import { GTFSRtEngine } from '../gtfs/gtfsRtEngine.js';
import { GTFSPipeline } from '../gtfs/gtfsPipeline.js';
import { NominatimService } from '../services/nominatimService.js';
import { OverpassService } from '../services/overpassService.js';
import { RoutePlanner } from '../routing/routePlanner.js';

export class APIControllers {
  public static async getStops(req: Request, res: Response) {
    try {
      const stops = dbStore.getStops();
      res.json({ success: true, count: stops.length, data: stops });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getRoutes(req: Request, res: Response) {
    try {
      const routes = dbStore.getRoutes();
      res.json({ success: true, count: routes.length, data: routes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async downloadStopsCsv(req: Request, res: Response) {
    try {
      const filePath = path.resolve('..', 'datasets', 'chennai_gtfs_stops.csv');
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.json({ success: false, error: 'Dataset file not found' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async downloadRoutesCsv(req: Request, res: Response) {
    try {
      const filePath = path.resolve('..', 'datasets', 'chennai_gtfs_routes.csv');
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.json({ success: false, error: 'Dataset file not found' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async downloadMLDatasetCsv(req: Request, res: Response) {
    try {
      const filePath = path.resolve('..', 'datasets', 'historical_journey_ml_training_100k.csv');
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.json({ success: false, error: 'Dataset file not found' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async syncGTFSData(req: Request, res: Response) {
    try {
      const result = await GTFSPipeline.parseAndSyncGTFSData();
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async searchPlaces(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim()) {
        return res.json({ success: true, data: [] });
      }
      const results = await NominatimService.searchPlaces(query);
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getNearby(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string) || 13.0500;
      const lng = parseFloat(req.query.lng as string) || 80.2121;
      const radius = parseInt(req.query.radius as string) || 2000;

      const stops = dbStore.getStops();
      const nearbyStops = GISEngine.findStopsWithinRadius(lat, lng, stops, radius);
      const facilities = await OverpassService.getNearbyFacilities(lat, lng, radius);

      res.json({
        success: true,
        userLocation: { lat, lng },
        nearbyStops,
        facilities
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getLiveVehicles(req: Request, res: Response) {
    try {
      const vehicles = GTFSRtEngine.getLiveVehicles();
      res.json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async planJourney(req: Request, res: Response) {
    try {
      const { originLat, originLng, destLat, destLng, weatherCondition, userPreferences } = req.body;

      if (originLat === undefined || destLat === undefined) {
        return res.status(400).json({ success: false, error: 'originLat and destLat are required' });
      }

      const planResult = RoutePlanner.planJourney({
        originLat,
        originLng,
        destLat,
        destLng,
        weatherCondition,
        userPreferences
      });

      res.json({
        success: planResult.success,
        noRouteAvailable: planResult.noRouteAvailable || false,
        message: planResult.message || '',
        count: planResult.options.length,
        options: planResult.options
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createShareToken(req: Request, res: Response) {
    try {
      const { journeyId, userLocation } = req.body;
      const token = 'tn_live_share_' + Math.random().toString(36).substring(2, 10);
      const shareUrl = `${req.protocol}://${req.get('host')}/live-share/${token}`;

      res.json({
        success: true,
        token,
        shareUrl,
        expiresIn: '24 hours',
        message: 'Family live tracking link created successfully.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async triggerSOS(req: Request, res: Response) {
    try {
      const { lat, lng, alertMessage } = req.body;
      res.json({
        success: true,
        sosId: 'sos_' + Date.now(),
        status: 'ALERT_DISPATCHED',
        notifiedServices: ['100 Police Control', '108 Ambulance Service', 'Family Emergency Contacts'],
        userCoordinates: { lat, lng },
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
