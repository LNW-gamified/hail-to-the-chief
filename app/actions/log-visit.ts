'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getRank } from '@/lib/ranks';
import { checkAchievements, type EarnedAchievement } from '@/lib/achievements';

export type { EarnedAchievement };

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

export type LogVisitResult = {
  visitId: string;
  visitDate: string;
  weather: { temp: string; conditions: string } | null;
  isHistoricDate: boolean;
  historicNote: string | null;
  earnedAchievements: EarnedAchievement[];
  xpEarned: number;
  rankUpTo: string | null;
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

// ── main server action ────────────────────────────────────────────────────────

export async function logVisit(input: LogVisitInput): Promise<LogVisitResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      visitId: '', visitDate: '', weather: null,
      isHistoricDate: false, historicNote: null,
      earnedAchievements: [], xpEarned: 0, rankUpTo: null,
      error: 'Not authenticated',
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
      earnedAchievements: [], xpEarned: 0, rankUpTo: null,
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

  // Look up the location tier so XP can be awarded regardless of what checkAchievements does
  const { data: locData } = await supabase
    .from('presidential_locations')
    .select('tier')
    .eq('id', input.locationId)
    .maybeSingle();
  const locTier = (locData as { tier: number } | null)?.tier ?? 1;

  // Award achievements (best-effort — checkAchievements does NOT write XP; that happens below)
  const earnedAchievements = await checkAchievements(supabase, user.id, {
    locationId: input.locationId,
    visitId: visit.id,
    moments: input.moments,
    visitDate: input.visitDate,
  }).catch(() => []);

  // XP sources
  const hasNotes   = !!(input.notes);
  const hasMoments = !!(input.moments?.length);
  const hasPhotos  = !!(input.photoUrls?.length);
  const hasFullLog = hasNotes && hasMoments && hasPhotos;

  const baseXP         = locTier === 1 ? 50 : locTier === 2 ? 25 : 15;
  const achXP          = earnedAchievements.reduce((s, a) => s + a.points, 0);
  const bonusFullLog   = hasFullLog ? 10 : 0;
  const bonusHistoric  = otdRow ? 25 : 0;
  const bonusFullTrip  = locTier === 1 && hasFullLog ? 15 : 0;
  const totalXP        = baseXP + achXP + bonusFullLog + bonusHistoric + bonusFullTrip;

  const { data: prof } = await supabase
    .from('user_profiles')
    .select('total_xp')
    .eq('id', user.id)
    .maybeSingle();

  const oldXP = prof?.total_xp ?? 0;
  const newXP = oldXP + totalXP;

  await supabase
    .from('user_profiles')
    .upsert({ id: user.id, total_xp: newXP }, { onConflict: 'id' });

  const oldRank = getRank(oldXP);
  const newRank = getRank(newXP);
  const rankUpTo = newRank.level > oldRank.level ? newRank.title : null;

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
    xpEarned: totalXP,
    rankUpTo,
  };
}

