# TN Bus Live — Tamil Nadu Intelligent Public Transport Platform

live website:https://where-is-my-bus-eta.vercel.app/

**TN Bus Live** is an AI-powered, production-grade intelligent public transport navigation platform built exclusively for Tamil Nadu State Transport buses (MTC Chennai, TNSTC Coimbatore/Madurai/Trichy/Salem, SETC express lines, town, and mini buses).

---

## Key Features

- **No Paid APIs**: Built using OpenStreetMap, Leaflet, React Leaflet, OSRM, Nominatim, Overpass API, and GTFS / GTFS-Realtime feeds.
- **Continuous Kalman Filter GPS Navigation**: Smooth position tracking without flickering or marker jumping.
- **Smart Multi-Modal Route Planner**: Multi-criteria route finder (Fastest, Cheapest, Least Walking, Auto Hybrid) with Auto vs Walk AI recommendation engine.
- **"I AM INSIDE THIS BUS" Journey Mode**: Automatic current stop detection, stops remaining counter, audio announcements, and off-route deviation alerts.
- **Python ML Microservice (FastAPI)**:
  - Model 1: Smart ETA Regression
  - Model 2: Delay Classifier & Risk Probability
  - Model 3: Bus Occupancy Prediction
  - Model 4: Explainable AI Route Recommendation
  - Model 5: Conversational RAG Transit Assistant
- **Bilingual Voice Guidance**: Speech announcements and turn-by-turn navigation in English & Tamil.
- **Emergency SOS & Family Live Tracking**: One-touch emergency alert dispatch and 24-hour live tracking share link generator for family members.
- **Glassmorphism UI**: Accessible Light/Dark mode design system built with React 19, Vite, Tailwind CSS, Framer Motion, and Recharts.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Leaflet / React Leaflet, Zustand, Recharts.
- **Backend API & GIS Engine**: Node.js LTS, Express, TypeScript, GIS Engine (Haversine, spatial indexer, snap-to-polyline), GTFS-RT Interpolator.
- **AI Microservice**: Python, FastAPI, Uvicorn, Scikit-learn, XGBoost, Pandas, NumPy.

---

## Quick Start

### 1. Setup Dependencies
```bash
npm run setup
```

### 2. Launch Backend Service (Port 5000)
```bash
npm run start:backend
```

### 3. Launch Python AI Microservice (Port 8000)
```bash
npm run start:ai
```

### 4. Launch Frontend App (Port 3000)
```bash
npm run start:frontend
```

---

## Architecture Diagram

```
                                  +---------------------------------------+
                                  |    Frontend Client (React 19 + TS)    |
                                  |  - React Leaflet / Custom Markers     |
                                  |  - Zustand Stores & Framer Motion     |
                                  |  - Kalman Filter GPS Tracking         |
                                  |  - Bilingual Speech Synthesis         |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |   Node.js Express Backend Service     |
                                  |  - GIS Engine & Spatial Indexer       |
                                  |  - GTFS / GTFS-RT Engine & Importer   |
                                  |  - Multi-Modal Route Planner          |
                                  |  - Nominatim / OSRM Proxy & Cache     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |     Python FastAPI AI Engine          |
                                  |  - Model 1: ETA Regression Model      |
                                  |  - Model 2: Delay Classifier          |
                                  |  - Model 3: Crowd / Occupancy Predict  |
                                  |  - Model 4: Auto vs Walk Predictor    |
                                  |  - Model 5: RAG Transit Assistant     |
                                  +---------------------------------------+
```
