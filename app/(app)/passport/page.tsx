import { createClient } from '@/lib/supabase-server';
import PassportClient, { type PassportEntry } from '@/components/passport/passport-client';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function PassportPage() {
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
      .select('display_name')
      .eq('id', user.id)
      .single(),

    supabase
      .from('presidential_locations')
      .select(`
        id, name, location_type, tier, city, state,
        presidents (number, name, era)
      `)
      .eq('is_active', true)
      .order('tier')
      .order('name'),

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

  const allEntries: PassportEntry[] = (rawLocations ?? []).map(loc => {
    const p = one(loc.presidents as never) as {
      number: number; name: string; era: string | null;
    } | null;
    return {
      locationId:      loc.id,
      locationName:    loc.name,
      city:            loc.city,
      state:           loc.state,
      tier:            loc.tier,
      presidentNumber: p?.number ?? null,
      presidentName:   p?.name   ?? null,
      era:             p?.era    ?? null,
      visitDate:       visitMap.get(loc.id) ?? null,
    };
  });

  // Sort NARA by president number; historic by president number then name
  const naraEntries = allEntries
    .filter(e => e.tier === 1)
    .sort((a, b) => (a.presidentNumber ?? 99) - (b.presidentNumber ?? 99));

  const historicEntries = allEntries
    .filter(e => e.tier !== 1)
    .sort((a, b) =>
      (a.presidentNumber ?? 99) - (b.presidentNumber ?? 99) ||
      a.locationName.localeCompare(b.locationName),
    );

  const displayName = profile?.display_name
    ?? user.email?.split('@')[0]
    ?? 'Historian';

  const passportNo = user.id.replace(/-/g, '').slice(0, 8).toUpperCase();

  return (
    <PassportClient
      naraEntries={naraEntries}
      historicEntries={historicEntries}
      displayName={displayName}
      passportNo={passportNo}
    />
  );
}
