type Props = {
  upNext: { locationName: string; visitDate: string } | null;
};

function daysAway(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visit = new Date(dateStr + 'T00:00:00');
  return Math.round((visit.getTime() - today.getTime()) / 86400000);
}

export default function MobileUpNext({ upNext }: Props) {
  if (!upNext) return null;

  const days = daysAway(upNext.visitDate);
  const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`;

  return (
    <div
      className="md:hidden fixed z-30 left-0 right-0 flex items-center px-4 gap-3 border-t border-border"
      style={{
        bottom: '64px',
        height: '44px',
        background: 'rgba(10, 22, 40, 0.95)',
      }}
    >
      <div className="w-1.5 h-6 bg-gold rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm text-cream truncate leading-none">
          {upNext.locationName}
        </p>
      </div>
      <span className="font-mono text-xs text-gold shrink-0">{label}</span>
    </div>
  );
}
