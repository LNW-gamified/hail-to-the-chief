'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { X, MapPin, Check, ExternalLink, Map, ChevronRight } from 'lucide-react';
import { ERA_COLORS } from '@/lib/era';
import { PortraitImg } from '@/components/ui/portrait-img';

// ── types ─────────────────────────────────────────────────────────────────────

export type MapEntry = {
  locationId: string;
  locationName: string;
  city: string;
  state: string;
  tier: number;
  latitude: number | null;
  longitude: number | null;
  presidentNumber: number | null;
  presidentName: string | null;
  portraitUrl: string | null;
  era: string | null;
  visitDate: string | null;
};

type Filter = 'all' | 'nara' | 'historic' | 'visited' | 'not_yet';

// ── state centroids for trail start ──────────────────────────────────────────

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL:[32.8,-86.8], AK:[64.2,-153.4], AZ:[34.3,-111.1], AR:[34.8,-92.2],
  CA:[36.8,-119.4], CO:[39.0,-105.5], CT:[41.6,-72.7], DE:[39.0,-75.5],
  FL:[27.8,-81.6], GA:[32.7,-83.4], HI:[20.9,-157.0], ID:[44.4,-114.6],
  IL:[40.0,-89.2], IN:[40.3,-86.1], IA:[42.0,-93.5], KS:[38.5,-98.4],
  KY:[37.5,-85.3], LA:[31.2,-92.3], ME:[45.3,-69.0], MD:[39.0,-76.8],
  MA:[42.2,-71.5], MI:[44.2,-84.6], MN:[46.4,-93.1], MS:[32.7,-89.7],
  MO:[38.5,-92.5], MT:[47.0,-110.5], NE:[41.5,-99.9], NV:[38.5,-117.1],
  NH:[43.7,-71.6], NJ:[40.1,-74.6], NM:[34.5,-106.0], NY:[43.0,-75.5],
  NC:[35.5,-79.8], ND:[47.5,-100.5], OH:[40.4,-82.9], OK:[35.6,-97.5],
  OR:[44.1,-120.5], PA:[40.6,-77.2], RI:[41.7,-71.5], SC:[33.8,-81.2],
  SD:[44.4,-100.2], TN:[35.7,-86.7], TX:[31.1,-97.6], UT:[39.3,-111.1],
  VT:[44.0,-72.7], VA:[37.9,-79.5], WA:[47.4,-120.5], WV:[38.6,-80.6],
  WI:[44.3,-89.8], WY:[43.0,-107.5], DC:[38.9,-77.0],
};

// ── nearest-neighbor trail builder ────────────────────────────────────────────

function buildTrail(
  naraEntries: MapEntry[],
  homeState: string | null,
): [number, number][] {
  const libs = naraEntries.filter(e => e.latitude != null && e.longitude != null);
  if (libs.length < 2) return libs.map(e => [e.latitude!, e.longitude!]);

  let [startLat, startLon]: [number, number] = [39.5, -98.35];
  if (homeState && STATE_CENTROIDS[homeState]) {
    [startLat, startLon] = STATE_CENTROIDS[homeState];
  }

  const remaining = [...libs];
  const tour: MapEntry[] = [];
  let curLat = startLat;
  let curLon = startLon;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dLat = (remaining[i].latitude ?? 0) - curLat;
      const dLon = (remaining[i].longitude ?? 0) - curLon;
      const dist = dLat * dLat + dLon * dLon;
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    tour.push(next);
    curLat = next.latitude!;
    curLon = next.longitude!;
  }

  return tour.map(e => [e.latitude!, e.longitude!]);
}

// ── dynamic import (no SSR) ───────────────────────────────────────────────────

const MapInner = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-navy">
      <p className="font-mono text-xs text-cream/30 animate-pulse tracking-widest">
        LOADING MAP…
      </p>
    </div>
  ),
});

// ── filter pills ──────────────────────────────────────────────────────────────

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: 'All'        },
  { id: 'nara',     label: 'Libraries'  },
  { id: 'historic', label: 'Historic'   },
  { id: 'visited',  label: 'Visited'    },
  { id: 'not_yet',  label: 'Not Yet'    },
];

// ── bottom sheet ──────────────────────────────────────────────────────────────

function BottomSheet({
  entry,
  onClose,
}: {
  entry: MapEntry | null;
  onClose: () => void;
}) {
  const visible = !!entry;
  const eraColor = ERA_COLORS[entry?.era ?? 'modern'] ?? '#C9A84C';
  const initials = entry?.presidentName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) ?? '?';

  const visitLabel = entry?.visitDate
    ? new Date(entry.visitDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          className="fixed inset-0 z-[1900] bg-transparent"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[2000] transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(110%)' }}
      >
        <div
          className="mx-auto rounded-t-2xl overflow-hidden"
          style={{
            maxWidth: 640,
            background: 'rgba(9,20,36,0.97)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(201,168,76,0.15)',
            borderLeft: '1px solid rgba(201,168,76,0.1)',
            borderRight: '1px solid rgba(201,168,76,0.1)',
          }}
        >
          {/* Era accent */}
          <div className="h-1" style={{ backgroundColor: eraColor }} />

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          {entry && (
            <div className="px-5 pt-2 pb-8">
              {/* Header row */}
              <div className="flex items-start gap-4">
                {/* Portrait */}
                <div
                  className="w-16 h-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center border-2"
                  style={{ borderColor: eraColor + '80', background: eraColor + '15' }}
                >
                  <PortraitImg
                    src={entry.portraitUrl}
                    alt={entry.presidentName ?? ''}
                    className="w-full h-full object-cover"
                    fallback={
                      <span className="font-mono text-lg font-bold" style={{ color: eraColor }}>
                        {initials}
                      </span>
                    }
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg text-cream leading-tight truncate">
                        {entry.presidentName ?? 'Unknown'}
                      </h3>
                      {entry.presidentNumber && (
                        <p className="font-mono text-[10px] text-cream/40">
                          {entry.presidentNumber}th President
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="text-cream/30 hover:text-cream/70 transition-colors shrink-0 mt-0.5"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Visit badge */}
                  {entry.visitDate ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Check size={11} className="text-gold" />
                      <span className="font-mono text-[10px] text-gold">
                        Visited {visitLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-block mt-1.5 font-mono text-[10px] text-cream/25 bg-border/30 rounded-full px-2 py-0.5">
                      Not Yet
                    </span>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mt-4 py-3 border-y border-border">
                <MapPin size={13} className="text-gold/60 shrink-0" />
                <div className="min-w-0">
                  <p className="font-serif text-sm text-cream/80 truncate">{entry.locationName}</p>
                  <p className="font-mono text-[11px]" style={{ color: '#8BBBD4' }}>{entry.city}, {entry.state}</p>
                </div>
                <span
                  className="ml-auto font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: (entry.tier === 1 ? '#C9A84C' : '#3A5A8A') + '4D',
                    color:      '#F5F0E8',
                    border:     `1px solid ${entry.tier === 1 ? '#C9A84C' : '#3A5A8A'}CC`,
                  }}
                >
                  {entry.tier === 1 ? 'NARA' : 'Historic Site'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  href={`/libraries/${entry.locationId}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gold text-navy font-mono text-sm font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors"
                >
                  View Details <ChevronRight size={14} />
                </Link>
                <Link
                  href={`/trips?location=${entry.locationId}`}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border text-cream/60 font-mono text-sm py-3 rounded-xl hover:border-gold/40 hover:text-gold transition-colors"
                >
                  <Map size={14} /> Plan Trip
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── main export ────────────────────────────────────────────────────────────────

export default function TrailMap({
  entries,
  homeState,
}: {
  entries: MapEntry[];
  homeState: string | null;
}) {
  const [filter, setFilter]           = useState<Filter>('all');
  const [showTrail, setShowTrail]     = useState(false);
  const [selected, setSelected]       = useState<MapEntry | null>(null);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'nara':     return entries.filter(e => e.tier === 1);
      case 'historic': return entries.filter(e => e.tier !== 1);
      case 'visited':  return entries.filter(e => !!e.visitDate);
      case 'not_yet':  return entries.filter(e => !e.visitDate);
      default:         return entries;
    }
  }, [entries, filter]);

  const trailCoords = useMemo(() => {
    if (!showTrail) return [];
    const nara = entries.filter(e => e.tier === 1);
    return buildTrail(nara, homeState);
  }, [showTrail, entries, homeState]);

  const handleMarkerClick = useCallback((e: MapEntry) => {
    setSelected(e);
  }, []);

  const naraCount     = entries.filter(e => e.tier === 1).length;
  const visitedCount  = entries.filter(e => !!e.visitDate).length;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(100dvh - 64px)' }}
    >
      {/* ── map ── */}
      <MapInner
        entries={filtered}
        trailCoords={trailCoords}
        showTrail={showTrail}
        onMarkerClick={handleMarkerClick}
      />

      {/* ── filter pills ── */}
      <div
        className="absolute top-3 left-1/2 z-[1000]"
        style={{ transform: 'translateX(-50%)' }}
      >
        <div
          className="flex gap-1.5 items-center px-2 py-1.5 rounded-full"
          style={{
            background: 'rgba(9,20,36,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201,168,76,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="font-mono text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition-colors"
              style={
                filter === f.id
                  ? { background: '#C9A84C', color: '#0A1628', fontWeight: 700 }
                  : { color: 'rgba(245,240,220,0.5)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── trail button ── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowTrail(v => !v)}
          className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-xl transition-all"
          style={{
            background: showTrail
              ? 'rgba(201,168,76,0.15)'
              : 'rgba(9,20,36,0.85)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${showTrail ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`,
            color: showTrail ? '#C9A84C' : 'rgba(245,240,220,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ fontSize: 14 }}>🗺️</span>
          {showTrail ? 'Hide Trail' : 'Full Trail'}
        </button>
      </div>

      {/* ── legend ── */}
      <div
        className="absolute bottom-[212px] md:bottom-5 right-3 z-[1000] flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
        style={{
          background: 'rgba(9,20,36,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <p className="font-mono text-[9px] text-cream/30 tracking-[0.2em] mb-0.5">LEGEND</p>
        {[
          { color: '#C9A84C', label: 'NARA Library', ring: true },
          { color: '#8AA8C8', label: 'Historic Site', ring: false },
        ].map(({ color, label, ring }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="rounded-full shrink-0"
              style={{
                width: ring ? 14 : 10,
                height: ring ? 14 : 10,
                background: 'rgba(9,20,36,0.95)',
                border: `2px solid ${color}`,
                boxShadow: ring ? `0 0 0 2px ${color}30` : 'none',
              }}
            />
            <span className="font-mono text-[10px]" style={{ color: 'rgba(245,240,220,0.5)' }}>
              {label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-0.5">
          <div
            className="rounded-full shrink-0"
            style={{
              width: 14, height: 14,
              background: '#C9A84C',
              border: '2px solid #F0D060',
              boxShadow: '0 0 0 3px rgba(201,168,76,0.2)',
            }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'rgba(245,240,220,0.5)' }}>
            Visited
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            style={{ width: 20, height: 2, background: '#C9A84C', opacity: 0.6, borderRadius: 1 }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'rgba(245,240,220,0.5)' }}>
            Trail
          </span>
        </div>
        <p className="font-mono text-[9px] text-cream/20 mt-0.5 text-right">
          {visitedCount}/{naraCount} NARA
        </p>
      </div>

      {/* ── bottom sheet ── */}
      <BottomSheet entry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
