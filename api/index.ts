import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { APIControllers } from '../backend/src/controllers/apiControllers.js';
import { GTFSRtEngine } from '../backend/src/gtfs/gtfsRtEngine.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Start GTFS-RT Live Simulation Engine
GTFSRtEngine.startLiveStream();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Where Is My Bus Backend API & GTFS Engine Service',
    timestamp: new Date().toISOString(),
    region: 'Tamil Nadu, India'
  });
});

// Core API Endpoints
app.get('/api/stops', APIControllers.getStops);
app.get('/api/routes', APIControllers.getRoutes);
app.get('/api/search', APIControllers.searchPlaces);
app.get('/api/nearby', APIControllers.getNearby);
app.get('/api/live', APIControllers.getLiveVehicles);
app.get('/api/datasets/stops.csv', APIControllers.downloadStopsCsv);
app.get('/api/datasets/routes.csv', APIControllers.downloadRoutesCsv);
app.get('/api/datasets/ml-training.csv', APIControllers.downloadMLDatasetCsv);
app.post('/api/gtfs/sync', APIControllers.syncGTFSData);
app.post('/api/journey/plan', APIControllers.planJourney);
app.post('/api/share', APIControllers.createShareToken);
app.post('/api/sos', APIControllers.triggerSOS);

export default app;
