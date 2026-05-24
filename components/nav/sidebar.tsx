'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Building2, Map, Plane, Trophy, BookOpen, User, Shield,
} from 'lucide-react';
import { getRank } from '@/lib/ranks';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/home',      label: 'Home',      Icon: Home      },
  { href: '/libraries', label: 'Libraries', Icon: Building2 },
  { href: '/map',       label: 'Map',       Icon: Map       },
  { href: '/trips',     label: 'Trips',     Icon: Plane     },
  { href: '/goals',     label: 'Goals',     Icon: Trophy    },
  { href: '/passport',  label: 'Passport',  Icon: BookOpen  },
  { href: '/profile',   label: 'Profile',   Icon: User      },
];

const TOTAL_NARA_LIBRARIES = 15;

type Props = {
  displayName: string | null;
  totalXp: number;
  upNext: { locationName: string; visitDate: string } | null;
  visitedCount: number;
};

function daysAway(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visit = new Date(dateStr + 'T00:00:00');
  return Math.round((visit.getTime() - today.getTime()) / 86400000);
}

function EagleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 8.5C8 6.5 4.5 5.5 1.5 6.5C3.5 7.5 5.5 8.5 7 10.5L10 8.5Z" />
      <path d="M10 8.5C12 6.5 15.5 5.5 18.5 6.5C16.5 7.5 14.5 8.5 13 10.5L10 8.5Z" />
      <ellipse cx="10" cy="12" rx="3" ry="3.5" />
      <circle cx="10" cy="5.5" r="2.3" />
      <path d="M12.5 5.5L14 6.5L12.5 7Z" />
      <path d="M8 15.5L10 14L12 15.5L11 18H9L8 15.5Z" />
    </svg>
  );
}

export default function Sidebar({ displayName, totalXp, upNext, visitedCount }: Props) {
  const pathname = usePathname();
  const rank = getRank(totalXp);
  const initials = (displayName ?? 'U').slice(0, 2).toUpperCase();

  const days = upNext ? daysAway(upNext.visitDate) : null;

  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 bg-navy border-r border-border h-screen">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-5">
        <span className="text-gold"><EagleIcon /></span>
        <span className="font-display text-xl text-gold leading-tight">
          Hail to the Chief
        </span>
      </div>

      {/* Rank badge */}
      <div className="mx-4 mb-3 bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gold/15 text-gold shrink-0">
            <Shield size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm text-gold truncate">{rank.title}</p>
            <p className="font-mono text-xs text-cream/50">{totalXp.toLocaleString()} XP</p>
          </div>
          <div className="ml-auto w-8 h-8 rounded-full bg-navy-secondary border border-border flex items-center justify-center shrink-0">
            <span className="font-mono text-xs text-cream/70">{initials}</span>
          </div>
        </div>
        {rank.nextRank && (
          <div className="mt-3">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${rank.progress}%` }}
              />
            </div>
            <p className="font-mono text-[10px] text-cream/40 mt-1">
              {rank.nextRank.minXp - totalXp} XP to {rank.nextRank.title}
            </p>
          </div>
        )}
      </div>

      {/* Up Next card */}
      {upNext && days !== null && (
        <div className="mx-4 mb-4 bg-card border border-border rounded-xl px-4 py-3">
          <p className="font-mono text-[10px] text-cream/40 tracking-widest mb-1.5">UP NEXT</p>
          <p className="font-serif text-sm text-cream leading-snug truncate">
            {upNext.locationName}
          </p>
          <p className="font-mono text-xs text-gold mt-0.5">
            {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days away`}
          </p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'border-l-2 border-gold text-gold bg-gold/8 pl-[14px] pr-4'
                  : 'border-l-2 border-transparent text-cream/60 hover:text-cream hover:bg-white/5 pl-[14px] pr-4',
              )}
            >
              <Icon size={17} />
              <span className="font-serif">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Progress footer */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-mono text-xs text-cream/50">Libraries visited</p>
          <p className="font-mono text-xs text-gold">
            {visitedCount} / {TOTAL_NARA_LIBRARIES}
          </p>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all"
            style={{ width: `${(visitedCount / TOTAL_NARA_LIBRARIES) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
