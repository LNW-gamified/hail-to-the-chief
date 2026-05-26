'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ERA_COLORS } from '@/lib/era';
import {
  Plus, Map, Calendar, Clock, ChevronRight,
  Route, X, Search, Check,
} from 'lucide-react';

// ── types ─────────────────────────────────────────────────────────────────────

export type TripStopSummary = {
  stopOrder: number;
  presidentNumber: number | null;
  presidentName: string | null;
  era: string | null;
  portraitUrl: string | null;
  locationId: string;
  locationName: string;
  state: string;
};

export type TripEntry = {
  id: string;
  name: string;
  status: 'planned' | 'in_progress' | 'completed';
  startDate: string | null;
  endDate: string | null;
  stopSummaries: TripStopSummary[];
  estimatedTotal: number | null;
};

export type LocationOption = {
  id: string;
  name: string;
  city: string;
  state: string;
  tier: number;
  websiteUrl: string | null;
  presidentNumber: number | null;
  presidentName: string | null;
  era: string | null;
  portraitUrl: string | null;
};

// ── name circuit suggestions ──────────────────────────────────────────────────

const NAME_CIRCUITS: Array<{
  name: string;
  test: (nums: Set<number>, states: string[]) => boolean;
}> = [
  { name: 'The Texas Three-Step',    test: n => [36, 41, 43].every(x => n.has(x)) },
  { name: 'The California Swing',    test: n => [37, 40].every(x => n.has(x)) },
  { name: 'The Heartland Journey',   test: n => [31, 33, 34].every(x => n.has(x)) },
  { name: 'The Southern Legacy',     test: n => [39, 42].some(x => n.has(x)) && n.has(36) },
  { name: 'The Bush Family Trail',   test: n => [41, 43].every(x => n.has(x)) },
  { name: 'The Cold War Circuit',    test: n => [34, 37, 38, 40].filter(x => n.has(x)).length >= 3 },
  { name: 'The Presidential Row',    test: n => [35, 36].every(x => n.has(x)) },
  {
    name: 'The New England Circuit',
    test: (_, s) => s.filter(x => ['MA','CT','NY','VT','NH','ME','RI'].includes(x)).length >= 2,
  },
  {
    name: 'The Pacific Circuit',
    test: (_, s) => s.filter(x => ['CA','OR','WA'].includes(x)).length >= 2,
  },
  {
    name: 'The Deep South Tour',
    test: (_, s) => s.filter(x => ['GA','TN','AR','MS','LA','AL'].includes(x)).length >= 2,
  },
];

function getNameSuggestions(selected: LocationOption[]): string[] {
  const nums  = new Set(selected.map(l => l.presidentNumber).filter(Boolean) as number[]);
  const states = selected.map(l => l.state);
  return NAME_CIRCUITS.filter(c => c.test(nums, states)).map(c => c.name).slice(0, 4);
}

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates TBD';
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  if (!end) return fmt(start);
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (s.getFullYear() === e.getFullYear()) {
    const sStr = new Date(start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${sStr} – ${fmt(end)}`;
  }
  return `${fmt(start)} – ${fmt(end)}`;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86_400_000);
}

function tripDays(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const diff =
    new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
  return Math.ceil(diff / 86_400_000) + 1;
}

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  planned:     { label: 'Planned',     bg: 'rgba(201,168,76,0.15)',  color: '#C9A84C', border: 'rgba(201,168,76,0.4)'  },
  in_progress: { label: 'In Progress', bg: 'rgba(59,130,246,0.15)',  color: '#60A5FA', border: 'rgba(59,130,246,0.4)'  },
  completed:   { label: 'Completed',   bg: 'rgba(34,197,94,0.15)',   color: '#4ADE80', border: 'rgba(34,197,94,0.4)'   },
};

// ── trip card ─────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: TripEntry }) {
  const first     = trip.stopSummaries[0];
  const eraColor  = ERA_COLORS[first?.era ?? ''] ?? ERA_COLORS.modern;
  const statusCfg = STATUS_CFG[trip.status];
  const days      = daysUntil(trip.startDate);
  const numDays   = tripDays(trip.startDate, trip.endDate);

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div
        className="rounded-xl overflow-hidden border transition-transform duration-200 group-hover:scale-[1.015]"
        style={{ borderColor: 'rgba(201,168,76,0.2)', background: '#0a1628' }}
      >
        {/* Hero */}
        <div
          className="relative h-44 overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${eraColor}55 0%, transparent 55%, #040e1c 100%)`,
          }}
        >
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 50%, #0a1628 100%)` }}
          />
          {first?.portraitUrl ? (
            <img
              src={first.portraitUrl}
              alt={first.presidentName ?? ''}
              className="absolute right-0 bottom-0 h-40 object-contain object-bottom"
              style={{ filter: 'drop-shadow(-4px 0 16px rgba(0,0,0,0.8))' }}
            />
          ) : (
            <div className="absolute right-5 bottom-5 w-20 h-24 rounded-lg flex items-center justify-center opacity-30"
              style={{ background: `${eraColor}33`, border: `1px solid ${eraColor}44` }}
            >
              <span style={{ fontSize: 36 }}>🏛️</span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
              style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
            >
              {statusCfg.label}
            </span>
            {trip.status === 'planned' && days !== null && days > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.4)' }}
              >
                {days}d away
              </span>
            )}
            {trip.status === 'planned' && days !== null && days === 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                style={{ background: 'rgba(34,197,94,0.25)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.5)' }}
              >
                Today!
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pt-3 pb-4">
          <h3 className="font-playfair text-lg font-bold text-white mb-2 leading-tight line-clamp-1">
            {trip.name}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-3"
            style={{ color: 'rgba(201,168,76,0.7)' }}
          >
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            {numDays > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {numDays} day{numDays !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Stop pills */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3 min-h-[24px]">
            {trip.stopSummaries.length === 0 ? (
              <span className="text-xs font-mono" style={{ color: 'rgba(201,168,76,0.4)' }}>
                No stops added yet
              </span>
            ) : (
              <>
                {trip.stopSummaries.slice(0, 4).map((s, i) => {
                  const c = ERA_COLORS[s.era ?? ''] ?? ERA_COLORS.modern;
                  return (
                    <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: `${c}22`, border: `1px solid ${c}44` }}
                    >
                      {s.portraitUrl ? (
                        <img src={s.portraitUrl} alt="" className="w-4 h-4 rounded-full object-cover object-top" />
                      ) : (
                        <span style={{ fontSize: 10, color: `${c}` }} className="font-mono font-bold">
                          {s.presidentNumber ?? '?'}
                        </span>
                      )}
                      <span className="font-mono text-white/60 truncate" style={{ fontSize: 10, maxWidth: 90 }}>
                        {s.locationName.replace(' Presidential Library and Museum', '').replace(' Presidential Library', '').replace(' Presidential Museum', '')}
                      </span>
                    </div>
                  );
                })}
                {trip.stopSummaries.length > 4 && (
                  <span className="text-xs font-mono" style={{ color: 'rgba(201,168,76,0.5)' }}>
                    +{trip.stopSummaries.length - 4}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span>{trip.stopSummaries.length} stop{trip.stopSummaries.length !== 1 ? 's' : ''}</span>
              {trip.estimatedTotal !== null && trip.estimatedTotal > 0 && (
                <span style={{ color: '#C9A84C' }}>
                  ${trip.estimatedTotal.toLocaleString()} est.
                </span>
              )}
            </div>
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
              style={{ color: 'rgba(201,168,76,0.5)' }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── plan trip modal ───────────────────────────────────────────────────────────

type PlanStop = LocationOption & { stopOrder: number };

function PlanTripModal({
  locations,
  onClose,
  onCreated,
}: {
  locations: LocationOption[];
  onClose: () => void;
  onCreated: (tripId: string) => void;
}) {
  const supabase = createClient();
  const [name, setName]       = useState('');
  const [status, setStatus]   = useState<'planned' | 'in_progress' | 'completed'>('planned');
  const [startDate, setStart] = useState('');
  const [endDate, setEnd]     = useState('');
  const [stops, setStops]     = useState<PlanStop[]>([]);
  const [query, setQuery]     = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [saving, setSaving]   = useState(false);

  const suggestions = useMemo(() => getNameSuggestions(stops), [stops]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return locations
      .filter(l => !stops.some(s => s.id === l.id))
      .filter(l =>
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.presidentName?.toLowerCase() ?? '').includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q)
      )
      .slice(0, 18);
  }, [locations, stops, query]);

  const addStop = (loc: LocationOption) => {
    setStops(prev => [...prev, { ...loc, stopOrder: prev.length + 1 }]);
    setQuery('');
    setShowDrop(false);
  };

  const removeStop = (id: string) => {
    setStops(prev =>
      prev.filter(s => s.id !== id).map((s, i) => ({ ...s, stopOrder: i + 1 }))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: name.trim(),
          status,
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .select('id')
        .single();

      if (error || !trip) throw error;

      if (stops.length > 0) {
        await supabase.from('trip_stops').insert(
          stops.map(s => ({
            trip_id: trip.id,
            location_id: s.id,
            stop_order: s.stopOrder,
          }))
        );
      }

      await supabase.from('trip_costs').insert({
        trip_id: trip.id,
        estimated_travel: 0,
        estimated_hotel: 0,
      });

      onCreated(trip.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(4,14,28,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-auto"
        style={{
          background: '#0d1f35',
          border: '1px solid rgba(201,168,76,0.25)',
          maxHeight: '90dvh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(201,168,76,0.15)' }}
        >
          <h2 className="font-playfair text-lg font-bold text-white">Plan New Trip</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter trip name…"
              className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white outline-none"
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.2)',
                caretColor: '#C9A84C',
              }}
            />
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setName(s)}
                    className="px-2.5 py-1 rounded-full text-xs font-mono transition-all hover:scale-105"
                    style={{
                      background: name === s ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.1)',
                      border: `1px solid ${name === s ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.25)'}`,
                      color: '#C9A84C',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['planned', 'in_progress', 'completed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="py-2 rounded-lg text-xs font-mono font-bold transition-all"
                  style={{
                    background: status === s ? STATUS_CFG[s].bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${status === s ? STATUS_CFG[s].border : 'rgba(255,255,255,0.1)'}`,
                    color: status === s ? STATUS_CFG[s].color : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Start Date', val: startDate, set: setStart },
              { label: 'End Date',   val: endDate,   set: setEnd   },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'rgba(201,168,76,0.8)' }}
                >
                  {label}
                </label>
                <input
                  type="date"
                  value={val}
                  onChange={e => set(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                  style={{
                    background: 'rgba(201,168,76,0.06)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    color: val ? 'white' : 'rgba(255,255,255,0.3)',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Stops */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Stops {stops.length > 0 && `(${stops.length})`}
            </label>

            {stops.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {stops.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
                  >
                    <span className="text-xs font-mono font-bold w-4 flex-shrink-0" style={{ color: 'rgba(201,168,76,0.6)' }}>
                      {i + 1}.
                    </span>
                    {s.portraitUrl && (
                      <img src={s.portraitUrl} alt="" className="w-6 h-6 rounded-full object-cover object-top flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-white truncate">{s.name}</div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'rgba(201,168,76,0.6)' }}>
                        {s.city}, {s.state}
                      </div>
                    </div>
                    <button
                      onClick={() => removeStop(s.id)}
                      className="p-0.5 transition-colors hover:text-red-400"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location search */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <Search size={13} style={{ color: 'rgba(201,168,76,0.5)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
                  onFocus={() => setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  placeholder="Search for a location to add…"
                  className="flex-1 bg-transparent text-sm font-mono text-white outline-none placeholder:text-white/25"
                  style={{ caretColor: '#C9A84C' }}
                />
              </div>

              {showDrop && (
                <div
                  className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg overflow-auto"
                  style={{
                    background: '#0a1628',
                    border: '1px solid rgba(201,168,76,0.25)',
                    maxHeight: 220,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}
                >
                  {filtered.map(loc => (
                    <button
                      key={loc.id}
                      onMouseDown={() => addStop(loc)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      {loc.portraitUrl ? (
                        <img src={loc.portraitUrl} alt="" className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ background: 'rgba(201,168,76,0.15)' }}
                        >
                          <span className="text-xs font-mono font-bold" style={{ color: '#C9A84C' }}>
                            {loc.presidentNumber ?? '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-white truncate">{loc.name}</div>
                        <div className="font-mono" style={{ fontSize: 10, color: 'rgba(201,168,76,0.55)' }}>
                          {loc.city}, {loc.state} ·{' '}
                          {loc.tier === 1 ? 'NARA Library' : loc.tier === 2 ? 'Historic Site' : 'Experience'}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs font-mono" style={{ color: 'rgba(201,168,76,0.4)' }}>
                      No locations found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-all"
            style={{
              background: name.trim() ? '#C9A84C' : 'rgba(201,168,76,0.25)',
              color: name.trim() ? '#0a1628' : 'rgba(201,168,76,0.35)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Creating…' : 'Create Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── optimizer banner ──────────────────────────────────────────────────────────

function OptimizerBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5"
      style={{
        background: 'linear-gradient(135deg, #0d1f35 0%, #162840 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
      }}
    >
      <div className="absolute top-0 right-0 w-48 h-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, #C9A84C 0%, transparent 70%)' }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          <Route size={22} style={{ color: '#C9A84C' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-playfair font-bold text-white mb-1">
            Find the Perfect Presidential Circuit
          </h3>
          <p className="text-xs font-mono mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Our Road Trip Optimizer plots the ideal multi-library route from your home
            state, minimizing drive time across all 15 NARA libraries.
          </p>
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all hover:brightness-110"
            style={{ background: '#C9A84C', color: '#0a1628' }}
          >
            <Map size={13} />
            Open Trail Map
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TripsClient({
  trips,
  locations,
}: {
  trips: TripEntry[];
  locations: LocationOption[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const totalLocations = useMemo(() => {
    const ids = new Set<string>();
    for (const t of trips) for (const s of t.stopSummaries) ids.add(s.locationId);
    return ids.size;
  }, [trips]);

  const planned = trips.filter(t => t.status !== 'completed').length;

  return (
    <>
      <div className="min-h-screen" style={{ background: '#040e1c' }}>
        {/* Header */}
        <div className="px-4 pt-8 pb-6 max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-white mb-1">
                The Campaign Trail
              </h1>
              <p className="text-sm font-mono" style={{ color: 'rgba(201,168,76,0.65)' }}>
                {planned} trip{planned !== 1 ? 's' : ''} planned
                {totalLocations > 0 && ` · ${totalLocations} librar${totalLocations !== 1 ? 'ies' : 'y'} covered`}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-mono font-bold flex-shrink-0 transition-all hover:brightness-110 active:scale-95"
              style={{ background: '#C9A84C', color: '#0a1628' }}
            >
              <Plus size={14} />
              Plan New Trip
            </button>
          </div>
        </div>

        <div className="px-4 pb-20 max-w-3xl mx-auto space-y-5">
          <OptimizerBanner />

          {trips.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ border: '1px dashed rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)' }}
            >
              <div className="text-5xl mb-3">🗺️</div>
              <h3 className="font-playfair text-xl font-bold text-white mb-1">
                No trips yet
              </h3>
              <p className="text-sm font-mono mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Plan your first presidential library road trip
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all hover:brightness-110"
                style={{ background: '#C9A84C', color: '#0a1628' }}
              >
                <Plus size={14} />
                Plan New Trip
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <PlanTripModal
          locations={locations}
          onClose={() => setShowModal(false)}
          onCreated={id => {
            setShowModal(false);
            router.push(`/trips/${id}`);
          }}
        />
      )}
    </>
  );
}
