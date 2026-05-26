'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Building2 } from 'lucide-react';
import { ERA_COLORS, ERA_LABELS, ordinal } from '@/lib/era';

// ── types ─────────────────────────────────────────────────────────────────────

export type LibraryEntry = {
  id: string;
  name: string;
  locationType: string;
  tier: number;
  city: string;
  state: string;
  imageUrl: string | null;
  president: {
    number: number;
    name: string;
    termStart: number;
    termEnd: number | null;
    era: string | null;
    tagline: string | null;
    historianRanking: number | null;
    portraitUrl: string | null;
    party: string | null;
  } | null;
  visitDate: string | null;
  visitId: string | null;
};

// ── constants ─────────────────────────────────────────────────────────────────

type Filter = 'all' | 'nara' | 'sites' | 'visited' | 'not_yet';
type Sort   = 'chronological' | 'geographical' | 'recently_visited';

const FILTER_LABELS: Record<Filter, string> = {
  all:      'All Libraries',
  nara:     'NARA (15)',
  sites:    'Historic Sites',
  visited:  'Visited',
  not_yet:  'Not Yet',
};

const SORT_LABELS: Record<Sort, string> = {
  chronological:     'Chronological',
  geographical:      'Geographical',
  recently_visited:  'Recently Visited',
};

const TOTAL_NARA = 15;

// ── card ──────────────────────────────────────────────────────────────────────

function LibraryCard({ entry }: { entry: LibraryEntry }) {
  const { president: p, visitDate } = entry;
  const visited = !!visitDate;
  const era = p?.era ?? 'modern';
  const eraColor = ERA_COLORS[era] ?? ERA_COLORS.modern;
  const eraLabel = ERA_LABELS[era] ?? era;

  const initials = p?.name
    ? p.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : '?';

  const visitLabel = visitDate
    ? new Date(visitDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <Link href={`/libraries/${entry.id}`} className="block group">
      <div
        className={[
          'relative bg-card rounded-xl overflow-hidden border transition-all duration-200',
          'group-hover:border-gold/40 group-hover:translate-y-[-1px]',
          visited
            ? 'border-gold/30'
            : 'border-border opacity-70 group-hover:opacity-90',
        ].join(' ')}
        style={visited ? { boxShadow: '0 0 18px rgba(201,168,76,0.10)' } : undefined}
      >
        {/* Era left accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ backgroundColor: eraColor }}
        />

        <div className="flex items-start gap-4 pl-5 pr-4 py-4">
          {/* Portrait */}
          <div
            className="w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-navy-secondary border-2"
            style={{ borderColor: visited ? eraColor + '80' : '#1E3A5F' }}
          >
            {p?.portraitUrl ? (
              <img src={p.portraitUrl} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-sm font-bold" style={{ color: eraColor }}>
                {initials}
              </span>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-base text-cream leading-tight truncate">
                  {p?.name ?? 'Unknown President'}
                </h3>
                {p && (
                  <p className="font-mono text-[10px] text-cream/35 mt-0.5">
                    {ordinal(p.number)} President of the United States
                  </p>
                )}
              </div>

              {/* Historian ranking pill */}
              {p?.historianRanking && (
                <span className="font-mono text-[10px] text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
                  #{p.historianRanking}
                </span>
              )}
            </div>

            {/* Library name */}
            <p className="font-serif text-sm text-cream/80 mt-1.5 truncate">{entry.name}</p>
            <p className="font-mono text-[11px] text-cream/35">{entry.city}, {entry.state}</p>

            {/* Era + years row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: eraColor + '22',
                  color: eraColor,
                  border: `1px solid ${eraColor}40`,
                }}
              >
                {eraLabel}
              </span>
              {p && (
                <span className="font-mono text-[10px] text-cream/30">
                  {p.termStart}–{p.termEnd ?? 'present'}
                </span>
              )}
            </div>

            {/* Tagline */}
            {p?.tagline && (
              <p className="font-serif text-xs text-cream/45 italic mt-1.5 truncate">
                &ldquo;{p.tagline}&rdquo;
              </p>
            )}

            {/* Visit date */}
            {visitLabel && (
              <p className="font-mono text-[11px] text-gold/60 mt-1.5">
                Visited {visitLabel}
              </p>
            )}
          </div>
        </div>

        {/* VISITED stamp */}
        {visited ? (
          <div className="absolute bottom-3 right-3 pointer-events-none select-none">
            <div
              className="px-2 py-0.5 rounded border-2"
              style={{
                borderColor: eraColor + '70',
                transform: 'rotate(-8deg)',
              }}
            >
              <span
                className="font-mono text-[9px] font-bold tracking-[0.2em]"
                style={{ color: eraColor + 'AA' }}
              >
                VISITED
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="font-mono text-[10px] text-cream/20 bg-border/30 rounded-full px-2 py-0.5">
              Not Yet
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── main client component ─────────────────────────────────────────────────────

export default function LibrariesClient({ entries }: { entries: LibraryEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort]     = useState<Sort>('chronological');

  const naraCount    = entries.filter(e => e.tier === 1).length;
  const visitedNara  = entries.filter(e => e.tier === 1 && e.visitDate).length;
  const progressPct  = Math.round((visitedNara / TOTAL_NARA) * 100);

  // ── filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    switch (filter) {
      case 'nara':     return entries.filter(e => e.tier === 1);
      case 'sites':    return entries.filter(e => e.tier !== 1);
      case 'visited':  return entries.filter(e => !!e.visitDate);
      case 'not_yet':  return entries.filter(e => !e.visitDate);
      default:         return entries;
    }
  }, [entries, filter]);

  // ── sort ────────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'geographical':
        return copy.sort((a, b) =>
          a.state.localeCompare(b.state) || a.city.localeCompare(b.city)
        );
      case 'recently_visited':
        return copy.sort((a, b) => {
          if (a.visitDate && b.visitDate) return b.visitDate.localeCompare(a.visitDate);
          if (a.visitDate) return -1;
          if (b.visitDate) return 1;
          return (a.president?.number ?? 99) - (b.president?.number ?? 99);
        });
      default: // chronological
        return copy.sort(
          (a, b) => (a.president?.number ?? 99) - (b.president?.number ?? 99)
        );
    }
  }, [filtered, sort]);

  // ── split visited / not yet ─────────────────────────────────────────────────
  const showSplit  = filter === 'all' || filter === 'nara' || filter === 'sites';
  const visitedItems  = showSplit ? sorted.filter(e => !!e.visitDate) : [];
  const notYetItems   = showSplit ? sorted.filter(e => !e.visitDate)  : sorted;
  const singleSection = !showSplit;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">

      {/* ── page header ── */}
      <div>
        <h1 className="font-display text-3xl text-cream mb-1">The Archives</h1>
        <p className="font-serif text-cream/50">
          {visitedNara} of {TOTAL_NARA} NARA Libraries Visited
        </p>
        <div className="mt-3 h-2 bg-border rounded-full overflow-hidden max-w-xs">
          <div
            className="h-full bg-gold rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── controls ── */}
      <div className="space-y-3">
        {/* filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'font-mono text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0',
                filter === f
                  ? 'bg-gold text-navy font-bold'
                  : 'bg-border/40 text-cream/50 hover:text-cream hover:bg-border/60',
              ].join(' ')}
            >
              {f === 'nara'
                ? `NARA (${naraCount})`
                : f === 'visited'
                  ? `Visited (${entries.filter(e => !!e.visitDate).length})`
                  : FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* sort row */}
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-cream/25 mr-1">SORT</span>
          {(Object.keys(SORT_LABELS) as Sort[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={[
                'font-mono text-xs px-2.5 py-1 rounded-lg transition-colors',
                sort === s
                  ? 'text-gold bg-gold/10 border border-gold/20'
                  : 'text-cream/35 hover:text-cream/60',
              ].join(' ')}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── empty state ── */}
      {sorted.length === 0 && (
        <div className="py-20 text-center">
          <Building2 size={48} className="text-cream/10 mx-auto mb-4" />
          <p className="font-serif text-cream/30">No libraries found for this filter.</p>
        </div>
      )}

      {/* ── single-section (Visited / Not Yet tabs) ── */}
      {singleSection && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map(e => <LibraryCard key={e.id} entry={e} />)}
        </div>
      )}

      {/* ── two-section layout (All / NARA / Sites) ── */}
      {!singleSection && (
        <div className="space-y-8">
          {visitedItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={15} className="text-gold" />
                <h2 className="font-display text-lg text-gold">
                  Visited ({visitedItems.length})
                </h2>
              </div>
              <div className="space-y-3">
                {visitedItems.map(e => <LibraryCard key={e.id} entry={e} />)}
              </div>
            </section>
          )}

          {notYetItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-display text-lg text-cream/35">
                  Not Yet ({notYetItems.length})
                </h2>
              </div>
              <div className="space-y-3">
                {notYetItems.map(e => <LibraryCard key={e.id} entry={e} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
