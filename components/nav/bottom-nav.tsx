'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Map, Trophy, Plane } from 'lucide-react';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/home',      label: 'Home',      Icon: Home      },
  { href: '/libraries', label: 'Libraries', Icon: Building2 },
  { href: '/map',       label: 'Map',       Icon: Map       },
  { href: '/goals',     label: 'Goals',     Icon: Trophy    },
  { href: '/trips',     label: 'Trips',     Icon: Plane     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-border"
      style={{
        background: 'rgba(10, 22, 40, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2.5 gap-1 transition-colors',
              active ? 'text-gold' : 'text-cream/50',
            )}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span className="font-mono text-[10px] tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
