import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import LibraryDetailClient, {
  type LocationData,
  type PresidentData,
  type VisitData,
  type NearbyLocation,
  type HistoricDay,
} from '@/components/libraries/library-detail-client';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function haversineMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function LibraryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: rawLocation },
    { data: rawVisits },
    { data: allLocations },
  ] = await Promise.all([
    supabase
      .from('presidential_locations')
      .select(`
        id, name, location_type, tier, address, city, state,
        latitude, longitude, description, hours, admission,
        website_url, image_url, signature_exhibits,
        collection_size, annual_visitors, year_opened,
        presidents (
          id, number, name, first_name, last_name, nickname,
          term_start, term_end, party, home_state,
          birth_year, death_year, birth_place, vice_presidents,
          historian_ranking, era, tagline, famous_quote,
          key_achievements, defining_moment, did_you_know, portrait_url
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single(),

    supabase
      .from('location_visits')
      .select('id, visit_date, notes, moments, photos, weather_temp, weather_conditions, weather_wind')
      .eq('user_id', user.id)
      .eq('location_id', id)
      .order('visit_date', { ascending: false }),

    supabase
      .from('presidential_locations')
      .select('id, name, city, state, tier, latitude, longitude, presidents(number, name)')
      .eq('is_active', true)
      .neq('id', id),
  ]);

  if (!rawLocation) notFound();

  const rawP = one(rawLocation.presidents as never) as {
    id: string; number: number; name: string; first_name: string; last_name: string;
    nickname: string | null; term_start: number; term_end: number | null;
    party: string | null; home_state: string | null; birth_year: number | null;
    death_year: number | null; birth_place: string | null; vice_presidents: string[] | null;
    historian_ranking: number | null; era: string | null; tagline: string | null;
    famous_quote: string | null; key_achievements: string[] | null;
    defining_moment: string | null; did_you_know: string | null; portrait_url: string | null;
  } | null;

  const president: PresidentData | null = rawP ? {
    id:               rawP.id,
    number:           rawP.number,
    name:             rawP.name,
    firstName:        rawP.first_name,
    lastName:         rawP.last_name,
    nickname:         rawP.nickname,
    termStart:        rawP.term_start,
    termEnd:          rawP.term_end,
    party:            rawP.party,
    homeState:        rawP.home_state,
    birthYear:        rawP.birth_year,
    deathYear:        rawP.death_year,
    birthPlace:       rawP.birth_place,
    vicePresidents:   rawP.vice_presidents,
    historianRanking: rawP.historian_ranking,
    era:              rawP.era,
    tagline:          rawP.tagline,
    famousQuote:      rawP.famous_quote,
    keyAchievements:  rawP.key_achievements,
    definingMoment:   rawP.defining_moment,
    didYouKnow:       rawP.did_you_know,
    portraitUrl:      rawP.portrait_url,
  } : null;

  const location: LocationData = {
    id:               rawLocation.id,
    name:             rawLocation.name,
    locationType:     rawLocation.location_type,
    tier:             rawLocation.tier,
    address:          rawLocation.address,
    city:             rawLocation.city,
    state:            rawLocation.state,
    latitude:         rawLocation.latitude,
    longitude:        rawLocation.longitude,
    description:      rawLocation.description,
    hours:            rawLocation.hours,
    admission:        rawLocation.admission,
    websiteUrl:       rawLocation.website_url,
    imageUrl:         rawLocation.image_url,
    signatureExhibits: rawLocation.signature_exhibits,
    collectionSize:   rawLocation.collection_size,
    annualVisitors:   rawLocation.annual_visitors,
    yearOpened:       rawLocation.year_opened,
    president,
  };

  const initialVisits: VisitData[] = (rawVisits ?? []).map(v => ({
    id:                v.id,
    visitDate:         v.visit_date,
    notes:             v.notes,
    moments:           v.moments,
    photos:            v.photos,
    weatherTemp:       v.weather_temp,
    weatherConditions: v.weather_conditions,
    weatherWind:       v.weather_wind,
  }));

  // Historic Day: today's on_this_day facts for this president
  const todayDate = new Date();
  let historicDay: HistoricDay | null = null;
  if (president) {
    const { data: hdRows } = await supabase
      .from('on_this_day')
      .select('fact, year, category')
      .eq('president_id', president.id)
      .eq('month', todayDate.getMonth() + 1)
      .eq('day', todayDate.getDate())
      .limit(3);

    const PRIORITY: Record<string, number> = {
      inauguration: 0, legislation: 1, war: 2, achievement: 3, death: 4, birth: 5, scandal: 6,
    };
    const best = (hdRows ?? [])
      .slice()
      .sort((a, b) => (PRIORITY[a.category ?? ''] ?? 99) - (PRIORITY[b.category ?? ''] ?? 99))[0];
    if (best) {
      historicDay = { fact: best.fact, year: best.year ?? null, category: best.category ?? '' };
    }
  }

  // Best trivia score for this president
  let bestTriviaScore: { score: number; completedAt: string } | null = null;
  if (president) {
    const { data: scores } = await supabase
      .from('trivia_scores')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .eq('president_id', president.id)
      .order('score', { ascending: false })
      .limit(1)
      .single();
    if (scores) {
      bestTriviaScore = { score: scores.score, completedAt: scores.completed_at };
    }
  }

  // Nearby locations (haversine, within 200 miles)
  const nearbyLocations: NearbyLocation[] = [];
  if (rawLocation.latitude != null && rawLocation.longitude != null) {
    for (const loc of allLocations ?? []) {
      if (loc.latitude == null || loc.longitude == null) continue;
      const dist = haversineMiles(
        rawLocation.latitude, rawLocation.longitude,
        loc.latitude, loc.longitude,
      );
      if (dist <= 200) {
        const nearP = one(loc.presidents as never) as {
          number: number; name: string;
        } | null;
        nearbyLocations.push({
          id:               loc.id,
          name:             loc.name,
          city:             loc.city,
          state:            loc.state,
          tier:             loc.tier,
          presidentName:    nearP?.name ?? null,
          presidentNumber:  nearP?.number ?? null,
          distanceMiles:    dist,
        });
      }
    }
    nearbyLocations.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }

  return (
    <LibraryDetailClient
      location={location}
      initialVisits={initialVisits}
      bestTriviaScore={bestTriviaScore}
      nearbyLocations={nearbyLocations}
      historicDay={historicDay}
    />
  );
}
