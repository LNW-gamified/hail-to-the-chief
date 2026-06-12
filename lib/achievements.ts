import type { SupabaseClient } from '@supabase/supabase-js';

export type EarnedAchievement = {
  name: string;
  icon: string;
  points: number;
};

type AchievementContext = {
  locationId?: string;
  visitId?: string;
  moments?: string[];
  visitDate?: string;
};

const MOMENT_ACHIEVEMENT: Record<string, string> = {
  '🏛️ Visited Replica Oval Office':  'Oval Office',
  '✈️ Boarded Air Force One':         'Air Force One',
  '📼 Heard Presidential Recordings': 'Recorded in History',
  '🎤 Attended Special Event':        'Living History',
};

const MOMENT_REPEATABLE: Record<string, string> = {
  '🎟️ Got Passport Stamped': 'Presidential Passport',
  '🎤 Attended Special Event': 'Living History',
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export async function checkAchievements(
  supabase: SupabaseClient,
  userId: string,
  context: AchievementContext = {},
): Promise<EarnedAchievement[]> {
  const [{ data: allVisits }, { data: alreadyEarned }, { data: achievements }] = await Promise.all([
    supabase
      .from('location_visits')
      .select('location_id, notes, moments, photos, drive_distance_miles, presidential_locations(tier, state, name, presidents(number, era))')
      .eq('user_id', userId),
    supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId),
    supabase
      .from('achievements')
      .select('id, name, icon, points, tracking_type, trigger_condition'),
  ]);

  if (!allVisits || !achievements) return [];

  const earnedIds = new Set((alreadyEarned ?? []).map((e: { achievement_id: string }) => e.achievement_id));

  const tier1Ids = new Set<string>();
  const tier2Ids = new Set<string>();
  const visitedStates = new Set<string>();
  const visitedPresNumbers = new Set<number>();
  const visitedEras = new Set<string>();
  const visitedNames = new Set<string>();
  const fullyLoggedTier1Ids = new Set<string>();
  let totalMiles = 0;
  let visitsWithNotes = 0;
  let fullLogVisits = 0;

  for (const v of allVisits) {
    const loc = one(v.presidential_locations as never) as {
      tier: number; state: string; name: string; presidents?: unknown;
    } | null;
    const pres = one(loc?.presidents as never) as { number: number; era: string | null } | null;

    if (loc) {
      const m = v.moments as string[] | null;
      const p = v.photos as string[] | null;
      const isFullLog = !!(v.notes && m?.length && p?.length);

      if (loc.tier === 1) {
        tier1Ids.add(v.location_id);
        if (isFullLog) fullyLoggedTier1Ids.add(v.location_id);
      } else {
        tier2Ids.add(v.location_id);
      }
      if (loc.state) visitedStates.add(loc.state);
      if (loc.name) visitedNames.add(loc.name);
      if (pres?.number) visitedPresNumbers.add(pres.number);
      if (pres?.era) visitedEras.add(pres.era);
    }
    if (v.drive_distance_miles) totalMiles += Number(v.drive_distance_miles);
    if (v.notes) visitsWithNotes++;
    const m = v.moments as string[] | null;
    const p = v.photos as string[] | null;
    if (v.notes && m?.length && p?.length) fullLogVisits++;
  }

  const eastCoast = new Set(['ME','NH','VT','MA','RI','CT','NY','NJ','DE','MD','PA','VA','NC','SC','GA','FL']);
  const westCoast = new Set(['CA','OR','WA']);
  const hasEast = [...visitedStates].some(s => eastCoast.has(s));
  const hasWest = [...visitedStates].some(s => westCoast.has(s));

  const newEarned: EarnedAchievement[] = [];

  for (const ach of achievements as Array<{
    id: string; name: string; icon: string; points: number;
    tracking_type: string; trigger_condition: Record<string, unknown> | null;
  }>) {
    if (earnedIds.has(ach.id)) continue;
    const cond = ach.trigger_condition;
    if (!cond) continue;
    let award = false;

    if (ach.tracking_type === 'auto_visit') {
      switch (cond.type) {
        case 'visit_count': {
          const tier = (cond.tier as number) ?? 1;
          const count = tier === 1 ? tier1Ids.size : tier2Ids.size;
          award = count >= ((cond.min_count as number) ?? 1);
          break;
        }
        case 'coast_to_coast':
          award = hasEast && hasWest;
          break;
        case 'visit_states_count':
          award = visitedStates.size >= ((cond.min_states as number) ?? 1);
          break;
        case 'visit_era':
          award = visitedEras.has((cond.era as string) ?? '');
          break;
        case 'visit_presidents':
          award = ((cond.president_numbers as number[]) ?? []).every(n => visitedPresNumbers.has(n));
          break;
        case 'visit_states': {
          const states = (cond.states as string[]) ?? [];
          award = states.filter(s => visitedStates.has(s)).length >= ((cond.min_count as number) ?? 1);
          break;
        }
        case 'visit_location_name':
          award = visitedNames.has((cond.name as string) ?? '');
          break;
        case 'notes_on_visits':
          award = visitsWithNotes >= ((cond.min_count as number) ?? 1);
          break;
        case 'full_log_visit':
          award = fullLogVisits >= 1;
          break;
        case 'libraries_and_sites':
          award = tier1Ids.size >= ((cond.min_libraries as number) ?? 15)
            && tier2Ids.size >= ((cond.min_sites as number) ?? 10);
          break;
        case 'total_miles':
          award = totalMiles >= ((cond.min_miles as number) ?? 500);
          break;
        case 'visit_presidents_plus_region': {
          const required = (cond.required_numbers as number[]) ?? [];
          const regionStates = new Set((cond.region_states as string[]) ?? []);
          const minRegion = (cond.min_region_count as number) ?? 1;
          const hasRequired = required.every(n => visitedPresNumbers.has(n));
          const regionCount = [...visitedStates].filter(s => regionStates.has(s)).length;
          award = hasRequired && regionCount >= minRegion;
          break;
        }
        case 'full_log_all_nara':
          award = fullyLoggedTier1Ids.size >= 15;
          break;
        case 'read_dossier':
          // Tracked via markDossierRead action — not evaluated here
          break;
      }
    } else if (ach.tracking_type === 'manual_once') {
      if (context.moments?.some(m => MOMENT_ACHIEVEMENT[m] === ach.name)) {
        award = true;
      }
    }

    if (award) {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: ach.id,
        manually_claimed: ach.tracking_type === 'manual_once',
      });
      if (!error) {
        newEarned.push({ name: ach.name, icon: ach.icon, points: ach.points });
      }
    }
  }

  if (context.visitId && context.visitDate) {
    const repeatableAchs = (achievements as Array<{ id: string; name: string; tracking_type: string }>)
      .filter(a => a.tracking_type === 'manual_repeatable');

    for (const ach of repeatableAchs) {
      const triggerMoment = Object.entries(MOMENT_REPEATABLE).find(([, name]) => name === ach.name)?.[0];
      if (triggerMoment && context.moments?.includes(triggerMoment)) {
        await supabase.from('achievement_claims').insert({
          user_id: userId,
          achievement_id: ach.id,
          location_visit_id: context.visitId,
          claim_date: context.visitDate,
        });
      }
    }
  }

  return newEarned;
}
