import { createClient } from '@/lib/supabase-server';
import LibrariesClient, { type LibraryEntry } from '@/components/libraries/libraries-client';

// Helper — Supabase FK joins can come back as object or single-element array
function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function LibrariesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: rawLocations }, { data: rawVisits }] = await Promise.all([
    supabase
      .from('presidential_locations')
      .select(`
        id, name, location_type, tier, city, state, image_url,
        presidents (
          number, name, term_start, term_end,
          era, tagline, historian_ranking, portrait_url, party
        )
      `)
      .eq('is_active', true),

    supabase
      .from('location_visits')
      .select('id, location_id, visit_date')
      .eq('user_id', user.id)
      .order('visit_date', { ascending: false }),
  ]);

  // Build a map: location_id → most recent visit
  const visitMap = new Map<string, { visitId: string; visitDate: string }>();
  for (const v of rawVisits ?? []) {
    if (!visitMap.has(v.location_id)) {
      visitMap.set(v.location_id, { visitId: v.id, visitDate: v.visit_date });
    }
  }

  const entries: LibraryEntry[] = (rawLocations ?? []).map(loc => {
    const p = one(loc.presidents as never) as {
      number: number; name: string; term_start: number; term_end: number | null;
      era: string | null; tagline: string | null; historian_ranking: number | null;
      portrait_url: string | null; party: string | null;
    } | null;

    const visit = visitMap.get(loc.id) ?? null;

    return {
      id: loc.id,
      name: loc.name,
      locationType: loc.location_type,
      tier: loc.tier,
      city: loc.city,
      state: loc.state,
      imageUrl: loc.image_url,
      president: p ? {
        number:           p.number,
        name:             p.name,
        termStart:        p.term_start,
        termEnd:          p.term_end,
        era:              p.era,
        tagline:          p.tagline,
        historianRanking: p.historian_ranking,
        portraitUrl:      p.portrait_url,
        party:            p.party,
      } : null,
      visitDate: visit?.visitDate ?? null,
      visitId:   visit?.visitId   ?? null,
    };
  });

  return <LibrariesClient entries={entries} />;
}
