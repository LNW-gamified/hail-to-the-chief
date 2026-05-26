import { createClient } from '@/lib/supabase-server';
import TripsClient, {
  type TripEntry,
  type LocationOption,
} from '@/components/trips/trips-client';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: rawTrips }, { data: rawLocations }] = await Promise.all([
    supabase
      .from('trips')
      .select(
        `
        id, name, status, start_date, end_date,
        trip_stops (
          stop_order, estimated_tickets, estimated_food, estimated_parking,
          presidential_locations (
            id, name, state,
            presidents (number, name, era, portrait_url)
          )
        ),
        trip_costs (estimated_travel, estimated_hotel)
      `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('presidential_locations')
      .select(
        `
        id, name, city, state, tier, website_url,
        presidents (number, name, era, portrait_url)
      `,
      )
      .eq('is_active', true)
      .order('name'),
  ]);

  const trips: TripEntry[] = (rawTrips ?? []).map(trip => {
    const rawStops = Array.isArray(trip.trip_stops) ? trip.trip_stops : [];
    const sortedStops = [...rawStops].sort(
      (a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0),
    );

    const rawCosts = Array.isArray(trip.trip_costs) ? trip.trip_costs : [];
    const costs = rawCosts.reduce(
      (acc, c) => ({
        travel: acc.travel + (c.estimated_travel ?? 0),
        hotel:  acc.hotel  + (c.estimated_hotel  ?? 0),
      }),
      { travel: 0, hotel: 0 },
    );

    let totalBudget = costs.travel + costs.hotel;
    for (const s of sortedStops) {
      totalBudget +=
        (s.estimated_tickets ?? 0) +
        (s.estimated_food    ?? 0) +
        (s.estimated_parking ?? 0);
    }

    const stopSummaries = sortedStops.map(s => {
      const loc = one(s.presidential_locations as never) as {
        id: string; name: string; state: string; presidents: unknown;
      } | null;
      const pres = one(loc?.presidents as never) as {
        number: number; name: string; era: string | null; portrait_url: string | null;
      } | null;
      return {
        stopOrder:       s.stop_order       ?? 0,
        presidentNumber: pres?.number       ?? null,
        presidentName:   pres?.name         ?? null,
        era:             pres?.era          ?? null,
        portraitUrl:     pres?.portrait_url ?? null,
        locationId:      loc?.id            ?? '',
        locationName:    loc?.name          ?? '',
        state:           loc?.state         ?? '',
      };
    });

    return {
      id:             trip.id,
      name:           trip.name,
      status:         (trip.status ?? 'planned') as TripEntry['status'],
      startDate:      trip.start_date ?? null,
      endDate:        trip.end_date   ?? null,
      stopSummaries,
      estimatedTotal: totalBudget > 0 ? totalBudget : null,
    };
  });

  const locations: LocationOption[] = (rawLocations ?? []).map(loc => {
    const p = one(loc.presidents as never) as {
      number: number; name: string; era: string | null; portrait_url: string | null;
    } | null;
    return {
      id:              loc.id,
      name:            loc.name,
      city:            loc.city,
      state:           loc.state,
      tier:            loc.tier,
      websiteUrl:      loc.website_url ?? null,
      presidentNumber: p?.number       ?? null,
      presidentName:   p?.name         ?? null,
      era:             p?.era          ?? null,
      portraitUrl:     p?.portrait_url ?? null,
    };
  });

  return <TripsClient trips={trips} locations={locations} />;
}
