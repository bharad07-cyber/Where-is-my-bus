import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../stores/useAppStore';
import { BusStop } from '../types';

// Custom Map Recenter Helper
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    map.invalidateSize();
  }, [center, zoom, map]);
  return null;
};

export const LiveMapComponent: React.FC = () => {
  const { userLocation, liveVehicles, setLiveVehicles, activeJourney, selectedVehicle, setSelectedVehicle } = useAppStore();
  const [mapStops, setMapStops] = useState<BusStop[]>([]);

  // Fetch stops & live vehicles for map initialization
  useEffect(() => {
    fetch('/api/stops')
      .then(res => res.json())
      .then(data => {
        if (data.data) setMapStops(data.data);
      })
      .catch(() => {});

    fetch('/api/live')
      .then(res => res.json())
      .then(data => {
        if (data.data) setLiveVehicles(data.data);
      })
      .catch(() => {});
  }, [setLiveVehicles]);

  const defaultCenter: [number, number] = userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
    ? [userLocation.lat, userLocation.lng]
    : [13.0514, 80.2245];

  // Leaflet Bus Icon
  const createBusIcon = (busNumber: string, isSelected: boolean) =>
    L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 38px; height: 38px; border-radius: 12px; background: ${isSelected ? '#f59e0b' : '#0284c7'}; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; border: 2px solid #ffffff;">
            🚌
          </div>
          <div style="position: absolute; bottom: -20px; padding: 2px 6px; border-radius: 9999px; background: rgba(15,23,42,0.95); border: 1px solid #334155; font-size: 10px; font-family: monospace; font-weight: 700; color: #ffffff; white-space: nowrap;">
            ${busNumber}
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

  // Leaflet User GPS Icon
  const userGpsIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="width: 24px; height: 24px; border-radius: 9999px; background: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%', minHeight: '350px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={defaultCenter} />

        {/* User GPS Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-slate-900">Your GPS Location</p>
                <p className="text-[10px] text-slate-600">Accuracy: {userLocation.accuracyMeters || 10}m</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Journey Route Highlight & Polyline */}
        {activeJourney && (
          <>
            {/* Draw Polyline */}
            <Polyline
              positions={
                activeJourney.option.steps
                  .filter(s => s.boardingStop && s.getOffStop)
                  .map(s => [s.boardingStop!.lat, s.boardingStop!.lng] as [number, number])
              }
              pathOptions={{ color: '#0ea5e9', weight: 6, opacity: 0.9, dashArray: '4, 8' }}
            />

            {/* Render Color-Coded GTFS Stop Progression Markers */}
            {activeJourney.completedStops.map((sName, idx) => {
              const stopObj = mapStops.find(s => s.name === sName);
              if (!stopObj) return null;
              return (
                <CircleMarker
                  key={`comp_m_${idx}`}
                  center={[stopObj.lat, stopObj.lng]}
                  radius={7}
                  pathOptions={{ color: '#64748b', fillColor: '#475569', fillOpacity: 0.8 }}
                >
                  <Popup>
                    <div className="font-sans text-xs">
                      <p className="font-bold text-slate-600">✓ Completed Stop</p>
                      <p className="font-semibold text-slate-800">{stopObj.name}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Glowing Blue Current Stop Marker */}
            {(() => {
              const currObj = mapStops.find(s => s.name === activeJourney.currentStopName);
              if (!currObj) return null;
              return (
                <CircleMarker
                  center={[currObj.lat, currObj.lng]}
                  radius={12}
                  pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 1, weight: 3 }}
                >
                  <Popup>
                    <div className="font-sans text-xs">
                      <p className="font-extrabold text-sky-600">📍 CURRENT STOP (YOU ARE HERE)</p>
                      <p className="font-bold text-slate-900">{currObj.name}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })()}

            {/* Glowing Green Next Stop Marker */}
            {(() => {
              const nextObj = mapStops.find(s => s.name === activeJourney.nextStopName);
              if (!nextObj) return null;
              return (
                <CircleMarker
                  center={[nextObj.lat, nextObj.lng]}
                  radius={10}
                  pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 1, weight: 3 }}
                >
                  <Popup>
                    <div className="font-sans text-xs">
                      <p className="font-extrabold text-emerald-600">➡ NEXT STOP (ARRIVING NEXT)</p>
                      <p className="font-bold text-slate-900">{nextObj.name}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })()}
          </>
        )}

        {/* Render Bus Stop Markers when no journey is active */}
        {!activeJourney && mapStops.map((stop) => (
          <CircleMarker
            key={stop.id}
            center={[stop.lat, stop.lng]}
            radius={6}
            pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1">
                <p className="font-extrabold text-slate-900">{stop.name}</p>
                <p className="text-emerald-600 font-bold text-[11px]">{stop.nameTamil}</p>
                <p className="text-slate-500 text-[10px]">{stop.area} • Routes: {stop.routes.join(', ')}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Live Vehicle Positions */}
        {liveVehicles.map((veh) => (
          <Marker
            key={veh.id}
            position={[veh.lat, veh.lng]}
            icon={createBusIcon(veh.busNumber, selectedVehicle?.id === veh.id)}
            eventHandlers={{
              click: () => setSelectedVehicle(veh)
            }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>MTC Bus {veh.busNumber}</span>
                  <span className="text-[10px] text-emerald-600">{veh.speedKmh} km/h</span>
                </p>
                <p className="text-slate-600 text-[11px]">Current: <strong>{veh.currentStopId.replace('stop_', '')}</strong></p>
                <p className="text-slate-600 text-[11px]">Next: <strong>{veh.nextStopId.replace('stop_', '')}</strong></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
