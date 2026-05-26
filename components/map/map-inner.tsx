'use client';

import { useEffect, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Polyline, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapEntry } from './trail-map';

// ── constants ─────────────────────────────────────────────────────────────────

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_matter_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// continental US default view
const CONTINENTAL_CENTER: [number, number] = [39.5, -98.35];
const CONTINENTAL_ZOOM = 4;

// ── custom marker factories ───────────────────────────────────────────────────

function naraIcon(number: number | null, visited: boolean): L.DivIcon {
  const size = 36;
  const bg      = visited ? '#C9A84C' : '#0F1E30';
  const fg      = visited ? '#0A1628' : '#C9A84C';
  const border  = visited ? '#F0D060' : 'rgba(201,168,76,0.45)';
  const glow    = visited
    ? 'box-shadow:0 0 0 5px rgba(201,168,76,0.22),0 3px 10px rgba(0,0,0,0.6);'
    : 'box-shadow:0 2px 8px rgba(0,0,0,0.6);';
  const badge = visited
    ? `<span style="position:absolute;top:-5px;right:-5px;width:15px;height:15px;
        background:#0A1628;border:1.5px solid #C9A84C;border-radius:50%;
        font-size:9px;line-height:15px;text-align:center;color:#C9A84C;">✓</span>`
    : '';

  return L.divIcon({
    html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${bg};border:2.5px solid ${border};${glow}
        display:flex;align-items:center;justify-content:center;
        font-family:'Courier New',monospace;font-size:11px;font-weight:700;
        color:${fg};position:relative;cursor:pointer;
      ">${number ?? '?'}${badge}</div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
    className:   '',
  });
}

function historicIcon(visited: boolean): L.DivIcon {
  const size   = 24;
  const bg     = visited ? '#C9A84C' : '#1A2A3A';
  const fg     = visited ? '#0A1628' : '#8A9EAE';
  const border = visited ? '#F0D060' : 'rgba(138,158,174,0.5)';
  const glow   = visited
    ? 'box-shadow:0 0 0 3px rgba(201,168,76,0.2),0 2px 6px rgba(0,0,0,0.5);'
    : 'box-shadow:0 2px 6px rgba(0,0,0,0.4);';

  return L.divIcon({
    html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${bg};border:2px solid ${border};${glow}
        display:flex;align-items:center;justify-content:center;
        font-size:10px;color:${fg};cursor:pointer;
      ">★</div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
    className:   '',
  });
}

// ── fit bounds helper ─────────────────────────────────────────────────────────

function FitBounds({ entries }: { entries: MapEntry[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || entries.length === 0) return;
    const valid = entries.filter(e => e.latitude != null && e.longitude != null);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(
      valid.map(e => [e.latitude!, e.longitude!] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10 });
    fitted.current = true;
  }, [map, entries]);
  return null;
}

// ── map ready (fix size in small containers) ──────────────────────────────────

function MapReady() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// ── trail polyline ─────────────────────────────────────────────────────────────

function TrailLine({ coords }: { coords: [number, number][] }) {
  if (coords.length < 2) return null;
  return (
    <Polyline
      positions={coords}
      pathOptions={{
        color: '#C9A84C',
        weight: 2,
        opacity: 0.65,
        dashArray: '8 5',
      }}
    />
  );
}

// ── inset map (AK / HI) ────────────────────────────────────────────────────────

function InsetMap({
  center,
  zoom,
  label,
  entries,
  onMarkerClick,
  style,
}: {
  center: [number, number];
  zoom: number;
  label: string;
  entries: MapEntry[];
  onMarkerClick: (e: MapEntry) => void;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute z-[900] rounded-lg overflow-hidden border"
      style={{ borderColor: 'rgba(201,168,76,0.25)', ...style }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        keyboard={false}
      >
        <TileLayer url={TILE_URL} />
        <MapReady />
        {entries.map(e => (
          <Marker
            key={e.locationId}
            position={[e.latitude!, e.longitude!]}
            icon={e.tier === 1 ? naraIcon(e.presidentNumber, !!e.visitDate) : historicIcon(!!e.visitDate)}
            eventHandlers={{ click: () => onMarkerClick(e) }}
          />
        ))}
      </MapContainer>
      <span
        className="absolute bottom-1 right-1.5 font-mono z-[1000] pointer-events-none"
        style={{ fontSize: 9, color: 'rgba(201,168,76,0.5)' }}
      >
        {label}
      </span>
    </div>
  );
}

// ── main map component ────────────────────────────────────────────────────────

export type MapInnerProps = {
  entries: MapEntry[];
  trailCoords: [number, number][];
  showTrail: boolean;
  onMarkerClick: (entry: MapEntry) => void;
};

export default function MapInner({
  entries,
  trailCoords,
  showTrail,
  onMarkerClick,
}: MapInnerProps) {
  const valid = entries.filter(e => e.latitude != null && e.longitude != null);
  const akEntries = valid.filter(e => e.state === 'AK');
  const hiEntries = valid.filter(e => e.state === 'HI');
  const mainEntries = valid.filter(e => e.state !== 'AK' && e.state !== 'HI');

  return (
    <>
      <style>{`
        .leaflet-container { background: #040e1c; font-family: 'Courier New', monospace; }
        .leaflet-control-zoom a {
          background: #0a1628 !important;
          color: #C9A84C !important;
          border-color: rgba(201,168,76,0.25) !important;
        }
        .leaflet-control-zoom a:hover { background: #152538 !important; }
        .leaflet-bar { border: 1px solid rgba(201,168,76,0.2) !important; box-shadow: 0 3px 12px rgba(0,0,0,0.6) !important; border-radius: 8px !important; overflow: hidden; }
        .leaflet-control-attribution { background: rgba(4,14,28,0.7) !important; color: rgba(255,255,255,0.3) !important; font-size: 9px !important; padding: 2px 6px !important; }
        .leaflet-control-attribution a { color: rgba(201,168,76,0.5) !important; }
      `}</style>

      <MapContainer
        center={CONTINENTAL_CENTER}
        zoom={CONTINENTAL_ZOOM}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <FitBounds entries={mainEntries} />

        {/* Trail route */}
        {showTrail && <TrailLine coords={trailCoords} />}

        {/* Markers */}
        {mainEntries.map(e => (
          <Marker
            key={e.locationId}
            position={[e.latitude!, e.longitude!]}
            icon={e.tier === 1
              ? naraIcon(e.presidentNumber, !!e.visitDate)
              : historicIcon(!!e.visitDate)
            }
            eventHandlers={{ click: () => onMarkerClick(e) }}
          />
        ))}
      </MapContainer>

      {/* Alaska inset */}
      <InsetMap
        center={[64, -153]}
        zoom={3}
        label="AK"
        entries={akEntries}
        onMarkerClick={onMarkerClick}
        style={{ bottom: 96, left: 8, width: 140, height: 96 }}
      />

      {/* Hawaii inset */}
      <InsetMap
        center={[20.8, -157]}
        zoom={6}
        label="HI"
        entries={hiEntries}
        onMarkerClick={onMarkerClick}
        style={{ bottom: 96, left: 156, width: 108, height: 96 }}
      />
    </>
  );
}
