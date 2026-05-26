import { createClient } from '@/lib/supabase-server';
import { getRank } from '@/lib/ranks';
import GoalsClient, {
  type GoalEntry,
  type QuizEntry,
  type RankInfo,
} from '@/components/goals/goals-client';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// ── visit facts used for progress calculations ────────────────────────────────

type VisitFact = {
  locationId: string;
  locationName: string;
  tier: number;
  state: string;
  presidentNumber: number | null;
  era: string | null;
  hasNotes: boolean;
  hasMoments: boolean;
  hasPhotos: boolean;
};

type TriviaFact = { presidentId: string; score: number };

// ── progress calculator ───────────────────────────────────────────────────────

function calcProgress(
  cond: Record<string, unknown>,
  visits: VisitFact[],
  trivia: TriviaFact[],
): { current: number; max: number } {
  const uniq = (pred: (v: VisitFact) => boolean) =>
    new Set(visits.filter(pred).map(v => v.locationId)).size;

  switch (cond.type) {
    case 'visit_count': {
      const tier = cond.tier as number | undefined;
      const n = tier ? uniq(v => v.tier === tier) : uniq(() => true);
      return { current: n, max: (cond.min_count as number) };
    }
    case 'visit_era': {
      return { current: visits.some(v => v.era === cond.era) ? 1 : 0, max: 1 };
    }
    case 'visit_presidents': {
      const nums = cond.president_numbers as number[];
      const seen = new Set(visits.map(v => v.presidentNumber));
      return { current: nums.filter(n => seen.has(n)).length, max: nums.length };
    }
    case 'libraries_and_sites': {
      const libMin  = cond.min_libraries as number;
      const siteMin = cond.min_sites    as number;
      const libs    = Math.min(uniq(v => v.tier === 1), libMin);
      const sites   = Math.min(uniq(v => v.tier !== 1), siteMin);
      return { current: libs + sites, max: libMin + siteMin };
    }
    case 'coast_to_coast': {
      const east = new Set(['MA','NY','ME','NH','VT','CT','RI','NJ','PA','MD','DE','VA','NC','SC','GA','FL']);
      const west = new Set(['CA','OR','WA']);
      const s    = new Set(visits.map(v => v.state));
      const e    = [...s].some(x => east.has(x)) ? 1 : 0;
      const w    = [...s].some(x => west.has(x)) ? 1 : 0;
      return { current: e + w, max: 2 };
    }
    case 'visit_states': {
      const allowed = cond.states as string[];
      const min = cond.min_count as number;
      const s = new Set(visits.map(v => v.state));
      return { current: Math.min(allowed.filter(x => s.has(x)).length, min), max: min };
    }
    case 'visit_states_count': {
      return { current: new Set(visits.map(v => v.state)).size, max: cond.min_states as number };
    }
    case 'visit_location_name': {
      const name = (cond.name as string).toLowerCase();
      return { current: visits.some(v => v.locationName.toLowerCase().includes(name)) ? 1 : 0, max: 1 };
    }
    case 'visit_presidents_plus_region': {
      const req     = cond.required_numbers  as number[];
      const rStates = cond.region_states     as string[];
      const minR    = cond.min_region_count  as number;
      const seen    = new Set(visits.map(v => v.presidentNumber));
      const reqDone = req.every(n => seen.has(n)) ? 1 : 0;
      const sVis    = new Set(visits.map(v => v.state));
      const rDone   = Math.min(rStates.filter(s => sVis.has(s)).length, minR);
      return { current: reqDone + rDone, max: 1 + minR };
    }
    case 'notes_on_visits': {
      return { current: Math.min(uniq(v => v.hasNotes), cond.min_count as number), max: cond.min_count as number };
    }
    case 'full_log_visit': {
      return { current: visits.some(v => v.hasNotes && v.hasMoments && v.hasPhotos) ? 1 : 0, max: 1 };
    }
    case 'full_log_all_nara': {
      return { current: uniq(v => v.tier === 1 && v.hasNotes && v.hasMoments && v.hasPhotos), max: 15 };
    }
    case 'quiz_complete': {
      const u = new Set(trivia.map(t => t.presidentId)).size;
      return { current: Math.min(u, cond.min_count as number), max: cond.min_count as number };
    }
    case 'quiz_complete_nara': {
      const u = new Set(trivia.map(t => t.presidentId)).size;
      return { current: Math.min(u, cond.min_count as number), max: cond.min_count as number };
    }
    case 'quiz_perfect_score': {
      return { current: trivia.some(t => t.score === 10) ? 1 : 0, max: 1 };
    }
    default:
      return { current: 0, max: 1 };
  }
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: rawAchievements },
    { data: rawEarned },
    { data: rawClaims },
    { data: rawVisits },
    { data: rawTrivia },
    { data: rawNaraLocs },
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('total_xp, display_name')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('achievements')
      .select('id, name, description, category, icon, points, tracking_type, trigger_condition')
      .order('category')
      .order('points'),

    supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id),

    supabase
      .from('achievement_claims')
      .select('achievement_id')
      .eq('user_id', user.id),

    supabase
      .from('location_visits')
      .select(`
        id, location_id, notes, moments, photos,
        presidential_locations (
          name, tier, state,
          presidents (number, era)
        )
      `)
      .eq('user_id', user.id),

    supabase
      .from('trivia_scores')
      .select('president_id, score, completed_at')
      .eq('user_id', user.id)
      .order('score', { ascending: false }),

    supabase
      .from('presidential_locations')
      .select(`
        id, name, city, state,
        presidents (id, number, name, era, portrait_url)
      `)
      .eq('tier', 1)
      .eq('is_active', true)
      .order('name'),
  ]);

  // Build visit facts
  const visitFacts: VisitFact[] = (rawVisits ?? []).map(v => {
    const loc = one(v.presidential_locations as never) as {
      name: string; tier: number; state: string;
      presidents: unknown;
    } | null;
    const pres = one(loc?.presidents as never) as {
      number: number; era: string | null;
    } | null;
    return {
      locationId:      v.location_id,
      locationName:    loc?.name           ?? '',
      tier:            loc?.tier           ?? 0,
      state:           loc?.state          ?? '',
      presidentNumber: pres?.number        ?? null,
      era:             pres?.era           ?? null,
      hasNotes:        !!(v.notes),
      hasMoments:      Array.isArray(v.moments) && v.moments.length > 0,
      hasPhotos:       Array.isArray(v.photos)  && v.photos.length  > 0,
    };
  });

  // Build trivia facts
  const triviaFacts: TriviaFact[] = (rawTrivia ?? []).map(t => ({
    presidentId: t.president_id,
    score:       t.score,
  }));

  // Maps for fast lookups
  const earnedMap  = new Map<string, string>();   // achievementId → earned_at
  for (const e of rawEarned ?? []) earnedMap.set(e.achievement_id, e.earned_at);

  const claimCounts = new Map<string, number>();   // achievementId → claim count
  for (const c of rawClaims ?? []) {
    claimCounts.set(c.achievement_id, (claimCounts.get(c.achievement_id) ?? 0) + 1);
  }

  // Build GoalEntry[]
  const goals: GoalEntry[] = (rawAchievements ?? []).map(a => {
    const earnedAt  = earnedMap.get(a.id) ?? null;
    const cond      = (a.trigger_condition ?? {}) as Record<string, unknown>;
    const isManual  = a.tracking_type === 'manual_once' || a.tracking_type === 'manual_repeatable';

    let progressCurrent = 0;
    let progressMax     = 1;

    if (earnedAt) {
      progressCurrent = 1;
      progressMax     = 1;
    } else if (!isManual) {
      const p = calcProgress(cond, visitFacts, triviaFacts);
      progressCurrent = p.current;
      progressMax     = p.max;
    }

    return {
      id:              a.id,
      name:            a.name,
      description:     a.description,
      category:        a.category,
      icon:            a.icon ?? '🏛️',
      points:          a.points,
      trackingType:    a.tracking_type as GoalEntry['trackingType'],
      earnedAt,
      progressCurrent,
      progressMax,
      claimCount:      claimCounts.get(a.id) ?? 0,
    };
  });

  // Build QuizEntry[] from NARA locations
  // Best score per president
  const bestScoreMap = new Map<string, { score: number; completedAt: string }>();
  for (const t of rawTrivia ?? []) {
    const existing = bestScoreMap.get(t.president_id);
    if (!existing || t.score > existing.score) {
      bestScoreMap.set(t.president_id, { score: t.score, completedAt: t.completed_at });
    }
  }

  const quizEntries: QuizEntry[] = (rawNaraLocs ?? []).map(loc => {
    const p = one(loc.presidents as never) as {
      id: string; number: number; name: string; era: string | null; portrait_url: string | null;
    } | null;
    const best = p ? bestScoreMap.get(p.id) ?? null : null;
    return {
      locationId:      loc.id,
      locationName:    loc.name,
      city:            loc.city,
      state:           loc.state,
      presidentId:     p?.id        ?? '',
      presidentNumber: p?.number    ?? 0,
      presidentName:   p?.name      ?? 'Unknown',
      presidentEra:    p?.era       ?? null,
      portraitUrl:     p?.portrait_url ?? null,
      bestScore:       best?.score       ?? null,
      completedAt:     best?.completedAt ?? null,
    };
  });

  // Rank info
  const xp = profile?.total_xp ?? 0;
  const rankData = getRank(xp);
  const rankInfo: RankInfo = {
    level:     rankData.level,
    title:     rankData.title,
    nextTitle: rankData.nextRank?.title ?? null,
    xp,
    progressPct: rankData.progress,
    xpToNext: rankData.nextRank
      ? rankData.nextRank.minXp - xp
      : null,
  };

  return (
    <GoalsClient
      goals={goals}
      quizEntries={quizEntries}
      rankInfo={rankInfo}
    />
  );
}
