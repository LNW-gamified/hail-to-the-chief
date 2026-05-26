import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import TripDetailClient, {
  type TripDetail,
  type TripStop,
  type ChecklistItem,
} from '@/components/trips/trip-detail-client';
import type { LocationOption } from '@/components/trips/trips-client';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: rawTrip },
    { data: rawStops },
    { data: rawCosts },
    { data: rawLocations },
  ] = await Promise.all([
    supabase
      .from('trips')
      .select('id, name, status, start_date, end_date, notes')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),

    supabase
      .from('trip_stops')
      .select(
        `
        id, stop_order, visit_date,
        ticket_section, ticket_row, ticket_seats, ticket_confirmation,
        estimated_tickets, actual_tickets,
        estimated_food, actual_food,
        estimated_parking, actual_parking,
        notes,
        presidential_locations (
          id, name, city, state, website_url, admission,
          presidents (number, name, era, portrait_url)
        ),
        stop_checklists (
          id, category, item, checked, suggested
        )
      `,
      )
      .eq('trip_id', id)
      .order('stop_order'),

    supabase
      .from('trip_costs')
      .select('id, estimated_travel, actual_travel, estimated_hotel, actual_hotel')
      .eq('trip_id', id)
      .maybeSingle(),

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

  if (!rawTrip) notFound();

  const stops: TripStop[] = (rawStops ?? []).map(s => {
    const loc = one(s.presidential_locations as never) as {
      id: string;
      name: string;
      city: string;
      state: string;
      website_url: string | null;
      admission: string | null;
      presidents: unknown;
    } | null;
    const pres = one(loc?.presidents as never) as {
      number: number;
      name: string;
      era: string | null;
      portrait_url: string | null;
    } | null;

    return {
      id:                 s.id,
      stopOrder:          s.stop_order          ?? 0,
      visitDate:          s.visit_date          ?? null,
      ticketSection:      s.ticket_section      ?? null,
      ticketRow:          s.ticket_row          ?? null,
      ticketSeats:        Array.isArray(s.ticket_seats) ? (s.ticket_seats as string[]) : null,
      ticketConfirmation: s.ticket_confirmation ?? null,
      estimatedTickets:   s.estimated_tickets   ?? 0,
      actualTickets:      s.actual_tickets      ?? null,
      estimatedFood:      s.estimated_food      ?? 0,
      actualFood:         s.actual_food         ?? null,
      estimatedParking:   s.estimated_parking   ?? 0,
      actualParking:      s.actual_parking      ?? null,
      notes:              s.notes               ?? null,
      location: loc
        ? {
            id:         loc.id,
            name:       loc.name,
            city:       loc.city,
            state:      loc.state,
            websiteUrl: loc.website_url ?? null,
            admission:  loc.admission   ?? null,
            president:  pres
              ? {
                  number:      pres.number,
                  name:        pres.name,
                  era:         pres.era,
                  portraitUrl: pres.portrait_url,
                }
              : null,
          }
        : null,
      checklists: Array.isArray(s.stop_checklists)
        ? (s.stop_checklists as ChecklistItem[])
        : [],
    };
  });

  const costs = rawCosts
    ? {
        id:              rawCosts.id,
        estimatedTravel: rawCosts.estimated_travel ?? 0,
        actualTravel:    rawCosts.actual_travel    ?? null,
        estimatedHotel:  rawCosts.estimated_hotel  ?? 0,
        actualHotel:     rawCosts.actual_hotel     ?? null,
      }
    : null;

  const trip: TripDetail = {
    id:        rawTrip.id,
    name:      rawTrip.name,
    status:    (rawTrip.status ?? 'planned') as TripDetail['status'],
    startDate: rawTrip.start_date ?? null,
    endDate:   rawTrip.end_date   ?? null,
    notes:     rawTrip.notes      ?? null,
    stops,
    costs,
  };

  const locations: LocationOption[] = (rawLocations ?? []).map(loc => {
    const p = one(loc.presidents as never) as {
      number: number;
      name: string;
      era: string | null;
      portrait_url: string | null;
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

  return <TripDetailClient trip={trip} locations={locations} />;
}
