import Link from 'next/link';
import { Building2, Landmark, MapPin, Zap, Navigation, Shield, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { getRank } from '@/lib/ranks';
import ProgressRing from '@/components/home/progress-ring';
import XpBar from '@/components/home/xp-bar';
import HomeLogVisitButton from '@/components/home/log-visit-button';
import OnThisDayCarousel, { type OnThisDayEntry } from '@/components/home/on-this-day-carousel';

const TOTAL_NARA = 15;

// ── helpers ──────────────────────────────────────────────────────────────────

function greeting(name: string | null): string {
  const h = new Date().getHours();
  const first = name?.split(' ')[0] ?? 'Chief';
  if (h < 12) return `Good morning, ${first}`;
  if (h < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function daysAway(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const visit = new Date(dateStr + 'T00:00:00');
  return Math.round((visit.getTime() - today.getTime()) / 86400000);
}

// Supabase sometimes returns a FK-joined row as object OR single-element array
function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function partyAbbr(party: string | null): string {
  if (!party) return '—';
  const map: Record<string, string> = {
    'Democratic': 'D', 'Republican': 'R', 'Whig': 'W',
    'Federalist': 'F', 'Democratic-Republican': 'DR',
    'Unaffiliated': 'U', 'National Union': 'NU',
  };
  return map[party] ?? party.slice(0, 2).toUpperCase();
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ── parallel fetches ──────────────────────────────────────────────────────
  const [
    { data: profile },
    { data: rawVisits },
    { data: activeTripRows },
    { data: onThisDayRows },
    { data: topPresidents },
    { data: rawRecent },
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('display_name, total_xp')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('location_visits')
      .select('location_id, drive_distance_miles, presidential_locations(tier, state)')
      .eq('user_id', user.id),

    supabase
      .from('trips')
      .select('id')
      .in('status', ['planned', 'in_progress']),

    supabase
      .from('on_this_day')
      .select('fact, year, category, presidents(name, number, portrait_url)')
      .eq('month', today.getMonth() + 1)
      .eq('day', today.getDate())
      .limit(3),

    supabase
      .from('presidents')
      .select('number, name, historian_ranking, party')
      .not('historian_ranking', 'is', null)
      .order('historian_ranking', { ascending: true })
      .limit(5),

    supabase
      .from('location_visits')
      .select('id, visit_date, presidential_locations(name, city, state, presidents(name, portrait_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  // ── compute visit stats ───────────────────────────────────────────────────
  const visits = rawVisits ?? [];

  const libraryIds = new Set(
    visits
      .filter(v => (one(v.presidential_locations as never) as { tier?: number } | null)?.tier === 1)
      .map(v => v.location_id),
  );
  const siteIds = new Set(
    visits
      .filter(v => {
        const tier = (one(v.presidential_locations as never) as { tier?: number } | null)?.tier;
        return tier && tier >= 2;
      })
      .map(v => v.location_id),
  );
  const states = new Set(
    visits
      .map(v => (one(v.presidential_locations as never) as { state?: string } | null)?.state)
      .filter(Boolean),
  );
  const miles = Math.round(
    visits.reduce((sum, v) => sum + (v.drive_distance_miles ?? 0), 0),
  );

  const librariesVisited = libraryIds.size;
  const historicVisited = siteIds.size;
  const statesCovered = states.size;

  // ── up next ───────────────────────────────────────────────────────────────
  type UpNext = {
    tripId: string;
    visitDate: string;
    locationName: string;
    locationCity: string;
    locationState: string;
    locationImage: string | null;
    presidentName: string | null;
    days: number;
  };

  let upNext: UpNext | null = null;
  if (activeTripRows && activeTripRows.length > 0) {
    const { data: nextStop } = await supabase
      .from('trip_stops')
      .select('visit_date, trip_id, presidential_locations(name, city, state, image_url, presidents(name))')
      .in('trip_id', activeTripRows.map(t => t.id))
      .not('visit_date', 'is', null)
      .gte('visit_date', todayStr)
      .order('visit_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextStop?.visit_date) {
      const loc = one(nextStop.presidential_locations as never) as {
        name?: string; city?: string; state?: string; image_url?: string;
        presidents?: { name?: string } | { name?: string }[];
      } | null;
      const pres = one(loc?.presidents as never) as { name?: string } | null;
      upNext = {
        tripId: nextStop.trip_id,
        visitDate: nextStop.visit_date,
        locationName: loc?.name ?? 'Unknown location',
        locationCity: loc?.city ?? '',
        locationState: loc?.state ?? '',
        locationImage: loc?.image_url ?? null,
        presidentName: pres?.name ?? null,
        days: daysAway(nextStop.visit_date),
      };
    }
  }

  // ── profile / rank ────────────────────────────────────────────────────────
  const totalXp = profile?.total_xp ?? 0;
  const displayName = profile?.display_name ?? null;
  const rank = getRank(totalXp);

  // ── on this day ───────────────────────────────────────────────────────────
  const CATEGORY_PRIORITY: Record<string, number> = {
    inauguration: 0, legislation: 1, war: 2, achievement: 3, death: 4, birth: 5, scandal: 6,
  };

  const otdEntries: OnThisDayEntry[] = (onThisDayRows ?? [])
    .slice()
    .sort((a, b) => {
      const pa = CATEGORY_PRIORITY[(a.category as string) ?? ''] ?? 99;
      const pb = CATEGORY_PRIORITY[(b.category as string) ?? ''] ?? 99;
      return pa - pb;
    })
    .map(row => {
      const pres = one(row.presidents as never) as {
        name?: string; number?: number; portrait_url?: string;
      } | null;
      return {
        fact: row.fact as string,
        year: (row.year as number | null) ?? null,
        category: (row.category as string) ?? '',
        presidentName: pres?.name ?? null,
        presidentNumber: pres?.number ?? null,
        portraitUrl: pres?.portrait_url ?? null,
      };
    });

  // ── recent visits ─────────────────────────────────────────────────────────
  const recent = (rawRecent ?? []).map(v => {
    const loc = one(v.presidential_locations as never) as {
      name?: string; city?: string; state?: string;
      presidents?: unknown;
    } | null;
    const pres = one(loc?.presidents as never) as { name?: string; portrait_url?: string } | null;
    return {
      id: v.id,
      visitDate: v.visit_date,
      locationName: loc?.name ?? 'Unknown',
      presidentName: pres?.name ?? null,
      portraitUrl: pres?.portrait_url ?? null,
    };
  });

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-5 py-6 md:px-8 md:py-8 space-y-8 max-w-6xl mx-auto">

      {/* ── page title ── */}
      <h1 className="font-display text-3xl text-cream">The Situation Room</h1>

      {/* ── daily briefing header ── */}
      <section className="relative overflow-hidden rounded-2xl bg-card border border-border px-8 py-10">
        {/* presidential seal watermark */}
        <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none select-none">
          <img src="/presidential-seal.svg" alt="" className="w-40 h-40 opacity-[0.07]" />
        </div>
        <div className="relative">
          <p className="font-mono text-[11px] text-gold/60 tracking-[0.25em] mb-3">
            DAILY BRIEFING · THE WHITE HOUSE
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-3">
            {greeting(displayName)}
          </h2>
          <p className="font-mono text-sm text-cream/40">{formatDate(today)}</p>
        </div>
      </section>

      {/* ── rank + up next ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* rank card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/50 flex items-center justify-center text-gold shrink-0"
              style={{ boxShadow: '0 0 24px rgba(201,168,76,0.3), 0 0 48px rgba(201,168,76,0.12)' }}
            >
              <Shield size={40} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-gold/70 text-xs">★</span>
                <p className="font-mono text-[11px] text-cream/40 tracking-widest">YOUR RANK</p>
                <span className="text-gold/70 text-xs">★</span>
              </div>
              <p className="font-display text-2xl text-gold">{rank.title}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-sm" style={{ color: '#A0AEC0' }}>
                {totalXp.toLocaleString()} XP earned
              </span>
              {rank.nextRank && (
                <span className="font-mono text-xs" style={{ color: '#8BA4BC' }}>
                  {(rank.nextRank.minXp - totalXp).toLocaleString()} to next
                </span>
              )}
            </div>
            <XpBar progress={rank.progress} />
            {rank.nextRank ? (
              <p className="font-mono text-xs text-cream/30">
                Next rank: {rank.nextRank.title}
              </p>
            ) : (
              <p className="font-mono text-xs text-gold/50">Maximum rank achieved</p>
            )}
          </div>
        </div>

        {/* up next card */}
        {upNext ? (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
            <p className="font-mono text-[11px] text-gold/60 tracking-[0.2em]">UP NEXT</p>

            <div className="flex items-start gap-4">
              {/* location thumbnail */}
              <div className="w-16 h-16 rounded-xl bg-navy-secondary border border-border shrink-0 overflow-hidden flex items-center justify-center">
                {upNext.locationImage ? (
                  <img
                    src={upNext.locationImage}
                    alt={upNext.locationName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={24} className="text-cream/20" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-cream leading-tight truncate">
                  {upNext.locationName}
                </p>
                <p className="font-serif text-sm mt-0.5" style={{ color: '#A0AEC0' }}>
                  {upNext.locationCity}, {upNext.locationState}
                </p>
                {upNext.presidentName && (
                  <p className="font-mono text-xs mt-1" style={{ color: '#A0AEC0' }}>
                    {upNext.presidentName}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="font-display text-3xl text-gold leading-none">
                  {upNext.days === 0 ? '!' : upNext.days}
                </p>
                <p className="font-mono text-[10px] text-cream/40">
                  {upNext.days === 0 ? 'today' : upNext.days === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            <Link
              href={`/trips/${upNext.tripId}`}
              className="mt-auto flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/15 border border-gold/30 rounded-xl py-2.5 font-mono text-sm text-gold transition-colors"
            >
              View Details <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <Building2 size={32} className="text-cream/15" />
            <p className="font-serif text-cream/40">No upcoming visits planned.</p>
            <Link
              href="/trips"
              className="font-mono text-sm text-gold/70 hover:text-gold transition-colors"
            >
              Plan a trip →
            </Link>
          </div>
        )}
      </div>

      {/* ── presidential initiative ── */}
      <section className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative shrink-0">
          <ProgressRing visited={librariesVisited} total={TOTAL_NARA} size={200} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-display text-5xl text-gold leading-none">{librariesVisited}</span>
            <span className="font-serif text-sm text-cream/50 mt-1">of {TOTAL_NARA}</span>
            <span className="font-mono text-[10px] text-cream/30 tracking-wide">LIBRARIES</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="font-mono text-[11px] text-gold/50 tracking-[0.25em] mb-2">
            PRESIDENTIAL LIBRARY INITIATIVE
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cream mb-1">
            {librariesVisited} of {TOTAL_NARA} Libraries Visited
          </h2>
          <p className="font-serif text-cream/50 mb-1">
            {historicVisited} historic site{historicVisited !== 1 ? 's' : ''} visited
          </p>
          <p className="font-serif text-gold/70 italic mb-6">
            &ldquo;Your legacy is being written.&rdquo;
          </p>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 bg-gold text-navy font-mono text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gold/90 transition-colors"
          >
            Plan Next Visit <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── state of the union stats ── */}
      <section>
        <p className="font-mono text-[11px] text-cream/30 tracking-[0.25em] mb-4">
          STATE OF THE UNION
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Libraries Visited',  value: librariesVisited, icon: Building2,  color: 'text-gold'       },
            { label: 'Historic Sites',     value: historicVisited,  icon: Landmark,   color: 'text-cream/70'   },
            { label: 'States Covered',     value: statesCovered,    icon: MapPin,     color: 'text-red'        },
            { label: 'Total XP',           value: totalXp,          icon: Zap,        color: 'text-gold'       },
            { label: 'Miles Traveled',     value: miles,            icon: Navigation, color: 'text-cream/70'   },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <Icon size={18} className={color} />
              <p className={`font-mono text-2xl font-bold ${color}`}>
                {value.toLocaleString()}
              </p>
              <p className="font-serif text-xs leading-tight" style={{ color: '#A0AEC0' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── intelligence briefing + historian rankings ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* intelligence briefing */}
        <section className="md:col-span-3 relative overflow-hidden bg-card border border-border rounded-2xl p-6">
          {/* classified watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span
              className="font-display text-6xl font-bold text-red/[0.05] tracking-[0.3em] whitespace-nowrap"
              style={{ transform: 'rotate(-25deg)' }}
            >
              CLASSIFIED
            </span>
          </div>

          <div className="relative">
            {/* header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
                  <p className="font-mono text-[11px] text-red/80 tracking-[0.2em]">
                    INTELLIGENCE BRIEFING
                  </p>
                </div>
                <p className="font-mono text-[10px] text-cream/30">{formatDate(today)} · FOR YOUR EYES ONLY</p>
              </div>
              <div className="w-9 h-9 bg-red/10 border border-red/20 rounded-lg flex items-center justify-center shrink-0">
                <span className="font-mono text-xs text-red font-bold">TS</span>
              </div>
            </div>

            {/* on this day */}
            <div className="mb-5">
              <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-3">
                ON THIS DAY IN PRESIDENTIAL HISTORY
              </p>
              <OnThisDayCarousel entries={otdEntries} />
            </div>

            <div className="border-t border-border pt-3">
              <p className="font-mono text-[9px] text-cream/15 tracking-widest">
                CLASSIFIED — DECLASSIFIED UPON REVIEW — FOR YOUR EYES ONLY
              </p>
            </div>
          </div>
        </section>

        {/* historian rankings */}
        <section className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-mono text-[11px] text-cream/30 tracking-[0.2em] mb-1">C-SPAN 2021</p>
              <h3 className="font-display text-lg text-cream">Historian Rankings</h3>
            </div>
            <Link
              href="/libraries"
              className="font-mono text-xs text-gold/60 hover:text-gold transition-colors"
            >
              All →
            </Link>
          </div>

          {topPresidents && topPresidents.length > 0 ? (
            <div className="space-y-3">
              {topPresidents.map((p, i) => (
                <div key={p.number} className="flex items-center gap-3">
                  <span className="font-mono text-sm text-gold w-4 shrink-0 text-center">
                    {i + 1}
                  </span>
                  <span className="font-serif text-sm text-cream flex-1 truncate">{p.name}</span>
                  <span className="font-mono text-[10px] text-cream/40 bg-border/60 px-1.5 py-0.5 rounded">
                    {partyAbbr(p.party)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-serif text-sm text-cream/30 italic">Rankings coming soon.</p>
          )}

          <div className="mt-5 pt-4 border-t border-border">
            <Link
              href="/libraries"
              className="flex items-center justify-center gap-2 font-mono text-xs text-gold/60 hover:text-gold transition-colors"
            >
              View Full Rankings <ArrowRight size={12} />
            </Link>
          </div>
        </section>
      </div>

      {/* ── recent activity ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-cream">Recent Activity</h3>
          <div className="flex items-center gap-3">
            <HomeLogVisitButton />
            <Link href="/passport" className="font-mono text-xs text-gold/60 hover:text-gold transition-colors">
              Full passport →
            </Link>
          </div>
        </div>

        {recent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recent.map(v => (
              <div key={v.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                {/* portrait */}
                <div className="w-11 h-11 rounded-full bg-navy-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  {v.portraitUrl ? (
                    <img src={v.portraitUrl} alt={v.presidentName ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-xs text-gold">
                      {v.presidentName?.split(' ').map(n => n[0]).join('') ?? '?'}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-serif text-sm text-cream truncate">{v.locationName}</p>
                  {v.presidentName && (
                    <p className="font-mono text-xs text-cream/40 truncate">{v.presidentName}</p>
                  )}
                  <p className="font-mono text-xs text-gold/60 mt-0.5">
                    {new Date(v.visitDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <Building2 size={36} className="text-cream/10 mx-auto mb-3" />
            <p className="font-serif text-cream/40 mb-4">
              No visits logged yet. Your legacy starts with the first stamp.
            </p>
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 font-mono text-sm text-gold/70 hover:text-gold transition-colors"
            >
              Plan your first trip <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}
