'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// ── types ─────────────────────────────────────────────────────────────────────

export type LogVisitInput = {
  locationId: string;
  visitDate: string;
  ticketSection?: string;
  ticketRow?: string;
  ticketSeats?: string[];
  ticketConfirmation?: string;
  moments?: string[];
  notes?: string;
  photoUrls?: string[];
  presidentId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type EarnedAchievement = {
  name: string;
  icon: string;
  points: number;
};

export type LogVisitResult = {
  visitId: string;
  visitDate: string;
  weather: { temp: string; conditions: string } | null;
  isHistoricDate: boolean;
  historicNote: string | null;
  earnedAchievements: EarnedAchievement[];
  error?: string;
};

// ── WMO weather code map ───────────────────────────────────────────────────────

const WMO: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm',
};

async function fetchWeather(
  lat: number,
  lon: number,
  date: string,
): Promise<{ temp: string; conditions: string } | null> {
  try {
    const url =
      `https://archive-api.open-meteo.com/v1/archive` +
      `?latitude=${lat}&longitude=${lon}` +
      `&start_date=${date}&end_date=${date}` +
      `&daily=temperature_2m_max,weathercode` +
      `&temperature_unit=fahrenheit&timezone=auto`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const j = await res.json();
    const temp = j.daily?.temperature_2m_max?.[0] as number | null | undefined;
    const code = j.daily?.weathercode?.[0] as number | null | undefined;
    if (temp == null && code == null) return null;
    return {
      temp: temp != null ? `${Math.round(temp)}°F` : '',
      conditions: code != null ? (WMO[code] ?? '') : '',
    };
  } catch {
    return null;
  }
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// ── main server action ────────────────────────────────────────────────────────

export async function logVisit(input: LogVisitInput): Promise<LogVisitResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      visitId: '', visitDate: '', weather: null,
      isHistoricDate: false, historicNote: null,
      earnedAchievements: [], error: 'Not authenticated',
    };
  }

  // Insert the visit record
  const { data: visit, error: insertErr } = await supabase
    .from('location_visits')
    .insert({
      user_id: user.id,
      location_id: input.locationId,
      visit_date: input.visitDate,
      ticket_section: input.ticketSection || null,
      ticket_row: input.ticketRow || null,
      ticket_seats: input.ticketSeats?.length ? input.ticketSeats : null,
      ticket_confirmation: input.ticketConfirmation || null,
      moments: input.moments?.length ? input.moments : null,
      notes: input.notes || null,
      photos: input.photoUrls?.length ? input.photoUrls : null,
    })
    .select('id, visit_date')
    .single();

  if (insertErr || !visit) {
    return {
      visitId: '', visitDate: '', weather: null,
      isHistoricDate: false, historicNote: null,
      earnedAchievements: [],
      error: insertErr?.message ?? 'Failed to save visit',
    };
  }

  // Fetch weather + check historic date in parallel
  const [month, day] = [
    Number(input.visitDate.split('-')[1]),
    Number(input.visitDate.split('-')[2]),
  ];

  const [weather, otdRow] = await Promise.all([
    input.latitude && input.longitude
      ? fetchWeather(input.latitude, input.longitude, input.visitDate)
      : null,
    input.presidentId
      ? supabase
          .from('on_this_day')
          .select('fact')
          .eq('month', month)
          .eq('day', day)
          .eq('president_id', input.presidentId)
          .limit(1)
          .maybeSingle()
          .then(r => r.data as { fact: string } | null)
      : null,
  ]);

  // Persist weather if fetched
  if (weather) {
    await supabase
      .from('location_visits')
      .update({ weather_temp: weather.temp, weather_conditions: weather.conditions })
      .eq('id', visit.id);
  }

  // Award achievements (best-effort — don't fail the visit if this errors)
  const earnedAchievements = await checkAndAward(supabase, user.id, input, visit.id).catch(() => []);

  revalidatePath('/home');
  revalidatePath('/libraries');
  revalidatePath('/passport');
  revalidatePath(`/libraries/${input.locationId}`);

  return {
    visitId: visit.id,
    visitDate: visit.visit_date,
    weather,
    isHistoricDate: !!otdRow,
    historicNote: otdRow?.fact ?? null,
    earnedAchievements,
  };
}

// ── achievement checker ───────────────────────────────────────────────────────

// Moments that auto-trigger manual_once achievements (key = stored moment value)
const MOMENT_ACHIEVEMENT: Record<string, string> = {
  '🏛️ Visited Replica Oval Office':   'Oval Office',
  '✈️ Boarded Air Force One':          'Air Force One',
  '📼 Heard Presidential Recordings':  'Recorded in History',
  '🎤 Attended Special Event':         'Living History',
};

// Moments that trigger manual_repeatable achievements
const MOMENT_REPEATABLE: Record<string, string> = {
  '🎟️ Got Passport Stamped': 'Presidential Passport',
  '🎤 Attended Special Event': 'Living History',
};

async function checkAndAward(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  input: LogVisitInput,
  visitId: string,
): Promise<EarnedAchievement[]> {
  // Fetch all data in parallel
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

  // Build visit stats
  const tier1Ids = new Set<string>();
  const tier2Ids = new Set<string>();
  const visitedStates = new Set<string>();
  const visitedPresNumbers = new Set<number>();
  const visitedEras = new Set<string>();
  const visitedNames = new Set<string>();
  let totalMiles = 0;
  let visitsWithNotes = 0;
  let fullLogVisits = 0;

  for (const v of allVisits) {
    const loc = one(v.presidential_locations as never) as {
      tier: number; state: string; name: string; presidents?: unknown;
    } | null;
    const pres = one(loc?.presidents as never) as { number: number; era: string | null } | null;

    if (loc) {
      if (loc.tier === 1) tier1Ids.add(v.location_id);
      else tier2Ids.add(v.location_id);
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
  let xpToAdd = 25; // base XP for every logged visit

  // Evaluate auto_visit and manual_once achievements
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
      }
    } else if (ach.tracking_type === 'manual_once') {
      const achName = MOMENT_ACHIEVEMENT[
        Object.keys(MOMENT_ACHIEVEMENT).find(k => MOMENT_ACHIEVEMENT[k] === ach.name) ?? ''
      ];
      if (achName === ach.name && input.moments?.some(m => MOMENT_ACHIEVEMENT[m] === ach.name)) {
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
        xpToAdd += ach.points;
      }
    }
  }

  // Handle manual_repeatable moments via achievement_claims
  const repeatableAchs = (achievements as Array<{ id: string; name: string; tracking_type: string }>)
    .filter(a => a.tracking_type === 'manual_repeatable');

  for (const ach of repeatableAchs) {
    const triggerMoment = Object.entries(MOMENT_REPEATABLE).find(([, name]) => name === ach.name)?.[0];
    if (triggerMoment && input.moments?.includes(triggerMoment)) {
      await supabase.from('achievement_claims').insert({
        user_id: userId,
        achievement_id: ach.id,
        location_visit_id: visitId,
        claim_date: input.visitDate,
      });
    }
  }

  // Update total XP
  const { data: prof } = await supabase
    .from('user_profiles')
    .select('total_xp')
    .eq('id', userId)
    .single();
  await supabase
    .from('user_profiles')
    .update({ total_xp: (prof?.total_xp ?? 0) + xpToAdd })
    .eq('id', userId);

  return newEarned;
}
