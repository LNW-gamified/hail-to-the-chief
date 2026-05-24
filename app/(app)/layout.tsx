import { createClient } from '@/lib/supabase-server';
import Sidebar from '@/components/nav/sidebar';
import BottomNav from '@/components/nav/bottom-nav';
import MobileUpNext from '@/components/nav/mobile-up-next';
import AppHeader from '@/components/nav/app-header';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile (may not exist yet for brand new users)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, total_xp')
    .eq('id', user?.id ?? '')
    .maybeSingle();

  // Fetch next planned trip stop
  const today = new Date().toISOString().split('T')[0];

  const { data: activeTripIds } = await supabase
    .from('trips')
    .select('id')
    .in('status', ['planned', 'in_progress']);

  let upNext: { locationName: string; visitDate: string } | null = null;

  if (activeTripIds && activeTripIds.length > 0) {
    const { data: nextStop } = await supabase
      .from('trip_stops')
      .select('visit_date, presidential_locations(name)')
      .in('trip_id', activeTripIds.map(t => t.id))
      .not('visit_date', 'is', null)
      .gte('visit_date', today)
      .order('visit_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextStop?.visit_date) {
      const loc = Array.isArray(nextStop.presidential_locations)
        ? nextStop.presidential_locations[0]
        : nextStop.presidential_locations;
      upNext = {
        visitDate: nextStop.visit_date,
        locationName: loc?.name ?? 'Unknown location',
      };
    }
  }

  // Count distinct NARA libraries visited by this user
  const { data: visitedRows } = await supabase
    .from('location_visits')
    .select('location_id')
    .eq('user_id', user?.id ?? '');

  const visitedCount = new Set(visitedRows?.map(r => r.location_id) ?? []).size;

  const displayName = profile?.display_name ?? null;
  const totalXp = profile?.total_xp ?? 0;

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      <Sidebar
        displayName={displayName}
        totalXp={totalXp}
        upNext={upNext}
        visitedCount={visitedCount}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader displayName={displayName} />

        <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
          {children}
        </main>

        <MobileUpNext upNext={upNext} />
        <BottomNav />
      </div>
    </div>
  );
}
