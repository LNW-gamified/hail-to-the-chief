const TZ = 'America/Los_Angeles';

function parts() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hour12: false,
  }).formatToParts(new Date());
}

function get(type: string): number {
  return parseInt(parts().find(p => p.type === type)!.value, 10);
}

// 'YYYY-MM-DD' in Pacific time
export function pacificToday(): string {
  const y = get('year');
  const m = get('month');
  const d = get('day');
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Current month (1–12) and day (1–31) in Pacific time
export function pacificMonthDay(): { month: number; day: number } {
  return { month: get('month'), day: get('day') };
}

// Current hour (0–23) in Pacific time
export function pacificHour(): number {
  return get('hour');
}

// Long-form date string in Pacific time, e.g. "Tuesday, June 10, 2026"
export function pacificDateLabel(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date());
}
