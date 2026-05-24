'use client';

import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/home':      'Home',
  '/libraries': 'Presidential Libraries',
  '/map':       'Map',
  '/trips':     'My Trips',
  '/goals':     'Goals',
  '/passport':  'My Passport',
  '/profile':   'Profile',
};

type Props = {
  displayName: string | null;
};

export default function AppHeader({ displayName }: Props) {
  const pathname = usePathname();
  const base = '/' + pathname.split('/')[1];
  const pageTitle = PAGE_TITLES[base] ?? 'Hail to the Chief';
  const initials = (displayName ?? 'U').slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0 bg-navy">
      {/* Desktop: page title */}
      <h1 className="hidden md:block font-display text-xl text-cream">{pageTitle}</h1>

      {/* Mobile: logo */}
      <span className="md:hidden font-display text-lg text-gold">Hail to the Chief</span>

      {/* Avatar — both breakpoints */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
          {displayName
            ? <span className="font-mono text-xs font-bold">{initials}</span>
            : <User size={15} />
          }
        </div>
      </div>
    </header>
  );
}
