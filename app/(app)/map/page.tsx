import { createClient } from '@/lib/supabase-server';
import TrailMap, { type MapEntry } from '@/components/map/trail-map';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: rawLocations },
    { data: rawVisits },
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('home_state')
      .eq('id', user.id)
      .single(),

    supabase
      .from('presidential_locations')
      .select(`
        id, name, location_type, tier, city, state, latitude, longitude,
        presidents (number, name, era, portrait_url)
      `)
      .eq('is_active', true),

    supabase
      .from('location_visits')
      .select('location_id, visit_date')
      .eq('user_id', user.id)
      .order('visit_date', { ascending: false }),
  ]);

  // Most-recent visit per location
  const visitMap = new Map<string, string>();
  for (const v of rawVisits ?? []) {
    if (!visitMap.has(v.location_id)) {
      visitMap.set(v.location_id, v.visit_date);
    }
  }

  const entries: MapEntry[] = (rawLocations ?? [])
    .filter(loc => loc.latitude != null && loc.longitude != null)
    .map(loc => {
      const p = one(loc.presidents as never) as {
        number: number; name: string; era: string | null; portrait_url: string | null;
      } | null;
      return {
        locationId:      loc.id,
        locationName:    loc.name,
        city:            loc.city,
        state:           loc.state,
        tier:            loc.tier,
        latitude:        loc.latitude,
        longitude:       loc.longitude,
        presidentNumber: p?.number       ?? null,
        presidentName:   p?.name         ?? null,
        portraitUrl:     p?.portrait_url ?? null,
        era:             p?.era           ?? null,
        visitDate:       visitMap.get(loc.id) ?? null,
      };
    });

  return (
    <TrailMap
      entries={entries}
      homeState={profile?.home_state ?? null}
    />
  );
}
