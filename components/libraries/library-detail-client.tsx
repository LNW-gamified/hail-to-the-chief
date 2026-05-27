'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check, Calendar, MapPin, Globe, Clock, Trophy, ChevronDown,
  Building2, Star, BookOpen, Map, MoreHorizontal, Pencil, Trash2,
  ExternalLink, Navigation,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { ERA_COLORS, ERA_LABELS, ordinal } from '@/lib/era';
import { PortraitImg } from '@/components/ui/portrait-img';
import LogVisitModal, { type LogVisitSuccessData } from '@/components/visits/log-visit-modal';

// ── types ─────────────────────────────────────────────────────────────────────

export type PresidentData = {
  id: string;
  number: number;
  name: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  termStart: number;
  termEnd: number | null;
  party: string | null;
  homeState: string | null;
  birthYear: number | null;
  deathYear: number | null;
  birthPlace: string | null;
  vicePresidents: string[] | null;
  historianRanking: number | null;
  era: string | null;
  tagline: string | null;
  famousQuote: string | null;
  keyAchievements: string[] | null;
  definingMoment: string | null;
  didYouKnow: string | null;
  portraitUrl: string | null;
};

export type LocationData = {
  id: string;
  name: string;
  locationType: string;
  tier: number;
  address: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  hours: string | null;
  admission: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  signatureExhibits: string[] | null;
  collectionSize: string | null;
  annualVisitors: string | null;
  yearOpened: number | null;
  president: PresidentData | null;
};

export type VisitData = {
  id: string;
  visitDate: string;
  notes: string | null;
  moments: string[] | null;
  photos: string[] | null;
  weatherTemp: string | null;
  weatherConditions: string | null;
  weatherWind: string | null;
};

export type NearbyLocation = {
  id: string;
  name: string;
  city: string;
  state: string;
  tier: number;
  presidentName: string | null;
  presidentNumber: number | null;
  distanceMiles: number;
};

type Tab = 'visit' | 'plan' | 'dossier' | 'library';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatVisitDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ── accordion ─────────────────────────────────────────────────────────────────

function Accordion({ title, icon, children, defaultOpen = false }: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gold/60">{icon}</span>}
          <span className="font-display text-base text-cream group-hover:text-gold transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-cream/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-5 space-y-3">{children}</div>}
    </div>
  );
}

// ── passport stamp ─────────────────────────────────────────────────────────────

function PassportStamp({ visitDate }: { visitDate: string }) {
  const d = new Date(visitDate + 'T00:00:00');
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  const year = d.getFullYear();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        {/* outer ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-gold/50 border-dashed animate-[spin_20s_linear_infinite]" />
        {/* inner ring */}
        <div className="absolute inset-2 rounded-full border-2 border-gold/40 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[9px] text-gold/60 tracking-widest leading-none">★</span>
          <span className="font-mono text-[10px] font-bold text-gold tracking-widest leading-tight mt-1">
            VISITED
          </span>
          <span className="font-mono text-[9px] text-gold/70 leading-none mt-0.5">
            {month} {day}
          </span>
          <span className="font-mono text-[9px] text-gold/50 leading-none">
            {year}
          </span>
        </div>
      </div>
      <p className="font-mono text-[10px] text-cream/30 tracking-widest">PRESIDENTIAL PASSPORT</p>
    </div>
  );
}

// ── your visit tab ─────────────────────────────────────────────────────────────

function YourVisitTab({ visits }: { visits: VisitData[] }) {
  if (visits.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar size={36} className="text-cream/10 mx-auto mb-3" />
        <p className="font-serif text-cream/40 mb-3">You haven&apos;t logged a visit yet.</p>
      </div>
    );
  }

  const latest = visits[0];

  return (
    <div className="space-y-6">
      {/* Visit date */}
      <div className="flex items-center gap-3 bg-navy-secondary rounded-xl px-4 py-3 border border-border">
        <Calendar size={18} className="text-gold shrink-0" />
        <div>
          <p className="font-mono text-[10px] text-cream/40 tracking-widest">VISITED</p>
          <p className="font-serif text-sm text-cream">{formatVisitDate(latest.visitDate)}</p>
        </div>
      </div>

      {/* Weather */}
      {(latest.weatherTemp || latest.weatherConditions) && (
        <div className="bg-navy-secondary rounded-xl px-4 py-3 border border-border">
          <p className="font-mono text-[10px] text-cream/40 tracking-widest mb-2">WEATHER</p>
          <div className="flex gap-4">
            {latest.weatherTemp && (
              <span className="font-mono text-sm text-cream/70">{latest.weatherTemp}</span>
            )}
            {latest.weatherConditions && (
              <span className="font-serif text-sm text-cream/60">{latest.weatherConditions}</span>
            )}
            {latest.weatherWind && (
              <span className="font-mono text-xs text-cream/40">{latest.weatherWind}</span>
            )}
          </div>
        </div>
      )}

      {/* Moments */}
      {latest.moments && latest.moments.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-cream/40 tracking-widest mb-2">MOMENTS</p>
          <div className="flex flex-wrap gap-2">
            {latest.moments.map((m, i) => (
              <span
                key={i}
                className="font-serif text-xs text-gold bg-gold/10 border border-gold/20 rounded-full px-3 py-1"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {latest.photos && latest.photos.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-cream/40 tracking-widest mb-2">YOUR PHOTOS</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {latest.photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Visit photo ${i + 1}`}
                className="h-32 w-auto rounded-xl object-cover shrink-0 border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {latest.notes && (
        <div>
          <p className="font-mono text-[10px] text-cream/40 tracking-widest mb-2">YOUR NOTES</p>
          <div className="bg-navy-secondary border border-border rounded-xl p-4">
            <p className="font-serif text-sm text-cream/80 leading-relaxed whitespace-pre-wrap">
              {latest.notes}
            </p>
          </div>
        </div>
      )}

      {/* Passport stamp */}
      <div className="bg-navy-secondary border border-border rounded-xl p-6 flex flex-col items-center">
        <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-4">
          PASSPORT STAMPED
        </p>
        <PassportStamp visitDate={latest.visitDate} />
      </div>
    </div>
  );
}

// ── plan visit tab ─────────────────────────────────────────────────────────────

function PlanVisitTab({ location }: { location: LocationData }) {
  const defaultItems = {
    photos:    ['Get the entrance sign', 'Portrait hall selfie', 'Oval Office replica (if available)'],
    exhibits:  location.signatureExhibits ?? [],
    gift_shop: ['Presidential seal merchandise', 'Collector books', 'Unique local items'],
    learn:     ['Primary presidency accomplishments', 'Historical context of the era'],
    must_do:   ['Watch the introductory film', 'Sign the guest book', 'Get passport stamped'],
  };

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const categories = [
    { key: 'exhibits',  emoji: '🏛️', label: 'Must See Exhibits' },
    { key: 'photos',    emoji: '📸', label: 'Photos'             },
    { key: 'must_do',   emoji: '✅', label: 'Must Do'            },
    { key: 'learn',     emoji: '📝', label: 'To Learn'           },
    { key: 'gift_shop', emoji: '🛍️', label: 'Gift Shop'          },
  ] as const;

  const mapsQuery = encodeURIComponent(`${location.name}, ${location.city}, ${location.state}`);
  const hotelsQuery = encodeURIComponent(`hotels near ${location.city}, ${location.state}`);

  return (
    <div className="space-y-6">
      {/* Hours + admission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-navy-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={15} className="text-gold" />
            <p className="font-mono text-[10px] text-cream/40 tracking-widest">HOURS</p>
          </div>
          <p className="font-serif text-sm text-cream/80 leading-relaxed">
            {location.hours ?? 'See official website for current hours.'}
          </p>
        </div>
        <div className="bg-navy-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={15} className="text-gold" />
            <p className="font-mono text-[10px] text-cream/40 tracking-widest">ADMISSION</p>
          </div>
          <p className="font-serif text-sm text-cream/80 leading-relaxed">
            {location.admission ?? 'See official website for current pricing.'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3 font-mono text-sm text-cream/70 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <Navigation size={15} /> Get Directions
        </a>
        <a
          href={`https://www.google.com/search?q=${hotelsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3 font-mono text-sm text-cream/70 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <MapPin size={15} /> Find Hotels
        </a>
      </div>

      {/* Don't forget checklist */}
      <div>
        <p className="font-mono text-[11px] text-cream/30 tracking-widest mb-3">
          DON&apos;T FORGET
        </p>
        <div className="space-y-4">
          {categories.map(({ key, emoji, label }) => {
            const items = defaultItems[key];
            if (items.length === 0) return null;
            return (
              <div key={key}>
                <p className="font-mono text-xs text-cream/50 mb-2">
                  {emoji} {label}
                </p>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const id = `${key}-${i}`;
                    return (
                      <label
                        key={id}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            checked[id]
                              ? 'bg-gold border-gold'
                              : 'border-border group-hover:border-gold/40'
                          }`}
                          onClick={() => toggle(id)}
                        >
                          {checked[id] && <Check size={11} className="text-navy" />}
                        </div>
                        <span
                          className={`font-serif text-sm transition-colors ${
                            checked[id] ? 'text-cream/30 line-through' : 'text-cream/70'
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── dossier tab ────────────────────────────────────────────────────────────────

function DossierTab({ president: p }: { president: PresidentData }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
        <p className="font-mono text-[10px] text-red/70 tracking-[0.2em]">
          CLASSIFIED DOSSIER — EYES ONLY
        </p>
      </div>

      <Accordion title="Early Life" defaultOpen icon={<BookOpen size={15} />}>
        <div className="space-y-2 font-serif text-sm text-cream/70 leading-relaxed">
          {p.birthPlace && (
            <p><span className="text-cream/40">Born:</span> {p.birthYear} · {p.birthPlace}</p>
          )}
          {p.deathYear && (
            <p><span className="text-cream/40">Died:</span> {p.deathYear}</p>
          )}
          {p.nickname && (
            <p><span className="text-cream/40">Known as:</span> &ldquo;{p.nickname}&rdquo;</p>
          )}
          {p.party && (
            <p><span className="text-cream/40">Party:</span> {p.party}</p>
          )}
          {p.homeState && (
            <p><span className="text-cream/40">Home state:</span> {p.homeState}</p>
          )}
        </div>
      </Accordion>

      <Accordion title="Key Achievements" icon={<Trophy size={15} />}>
        {p.keyAchievements && p.keyAchievements.length > 0 ? (
          <ul className="space-y-2">
            {p.keyAchievements.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold mt-0.5 shrink-0">★</span>
                <span className="font-serif text-sm text-cream/75 leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-serif text-sm text-cream/30 italic">Not yet available.</p>
        )}
      </Accordion>

      <Accordion title="Defining Moment" icon={<Star size={15} />}>
        {p.definingMoment ? (
          <p className="font-serif text-sm text-cream/75 leading-relaxed">{p.definingMoment}</p>
        ) : (
          <p className="font-serif text-sm text-cream/30 italic">Not yet available.</p>
        )}
      </Accordion>

      <Accordion title="Famous Quote">
        {p.famousQuote ? (
          <div className="relative pl-5 border-l-2 border-gold/30">
            <p className="font-display text-lg text-cream/80 italic leading-relaxed">
              &ldquo;{p.famousQuote}&rdquo;
            </p>
            <p className="font-mono text-xs text-cream/40 mt-2">— {p.name}</p>
          </div>
        ) : (
          <p className="font-serif text-sm text-cream/30 italic">Not yet available.</p>
        )}
      </Accordion>

      <Accordion title="Did You Know?">
        {p.didYouKnow ? (
          <div className="bg-gold/8 border border-gold/20 rounded-xl p-4">
            <p className="font-serif text-sm text-cream/80 leading-relaxed">{p.didYouKnow}</p>
          </div>
        ) : (
          <p className="font-serif text-sm text-cream/30 italic">Not yet available.</p>
        )}
      </Accordion>

      <Accordion title="Historian's Verdict">
        <div className="space-y-3">
          {p.historianRanking ? (
            <>
              <div className="flex items-center gap-3">
                <span className="font-display text-4xl text-gold">#{p.historianRanking}</span>
                <div>
                  <p className="font-serif text-sm text-cream/70 leading-relaxed">
                    Ranked {ordinal(p.historianRanking)} of 45 presidents by historians in
                    the C-SPAN 2021 Presidential Historians Survey.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="font-serif text-sm text-cream/30 italic">Ranking not available.</p>
          )}
        </div>
      </Accordion>

      <Accordion title="Presidential Timeline">
        <div className="relative pl-4 border-l-2 border-border space-y-4">
          {[
            { year: p.birthYear, label: `Born in ${p.birthPlace ?? 'unknown'}` },
            { year: p.termStart, label: `Inaugurated as ${ordinal(p.number)} President` },
            { year: p.termEnd ?? null, label: p.termEnd ? 'Left office' : 'Currently serving' },
            { year: p.deathYear ?? null, label: 'Died' },
          ]
            .filter(e => e.year !== null)
            .map((e, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-navy-secondary border-2 border-gold/40" />
                <p className="font-mono text-xs text-gold/70">{e.year}</p>
                <p className="font-serif text-sm text-cream/70">{e.label}</p>
              </div>
            ))}
        </div>
      </Accordion>
    </div>
  );
}

// ── library tab ────────────────────────────────────────────────────────────────

function LibraryTab({ location }: { location: LocationData }) {
  return (
    <div className="space-y-5">
      {location.description && (
        <p className="font-serif text-base text-cream/75 leading-relaxed">
          {location.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {location.collectionSize && (
          <div className="bg-navy-secondary border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] text-cream/35 tracking-widest mb-1">COLLECTION</p>
            <p className="font-display text-lg text-gold">{location.collectionSize}</p>
          </div>
        )}
        {location.annualVisitors && (
          <div className="bg-navy-secondary border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] text-cream/35 tracking-widest mb-1">ANNUAL VISITORS</p>
            <p className="font-display text-lg text-gold">{location.annualVisitors}</p>
          </div>
        )}
        {location.yearOpened && (
          <div className="bg-navy-secondary border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] text-cream/35 tracking-widest mb-1">OPENED</p>
            <p className="font-display text-lg text-gold">{location.yearOpened}</p>
          </div>
        )}
      </div>

      {/* Signature exhibits */}
      {location.signatureExhibits && location.signatureExhibits.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-cream/35 tracking-widest mb-3">
            SIGNATURE EXHIBITS
          </p>
          <ul className="space-y-2">
            {location.signatureExhibits.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold mt-0.5 shrink-0 font-mono text-xs">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-sm text-cream/70">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Address + website */}
      <div className="space-y-2">
        {location.address && (
          <div className="flex items-start gap-2 text-cream/50">
            <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
            <p className="font-mono text-sm">{location.address}, {location.city}, {location.state}</p>
          </div>
        )}
        {location.websiteUrl && (
          <a
            href={location.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gold/70 hover:text-gold transition-colors"
          >
            <Globe size={14} />
            <span className="font-mono text-sm">Official Website</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── trivia section ─────────────────────────────────────────────────────────────

function TriviaSection({
  president,
  bestScore,
}: {
  president: PresidentData;
  bestScore: { score: number; completedAt: string } | null;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-1">PRESIDENTIAL TRIVIA</p>
          <h3 className="font-display text-xl text-cream">Test Your Knowledge</h3>
          <p className="font-serif text-sm text-cream/50 mt-1">
            10 questions about {president.name}
          </p>
          {bestScore && (
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-xs text-gold">
                Best score: {bestScore.score}/10
              </span>
              {bestScore.score === 10 && (
                <span className="font-mono text-[10px] bg-gold/15 text-gold border border-gold/30 rounded-full px-2 py-0.5">
                  💯 PERFECT
                </span>
              )}
            </div>
          )}
        </div>
        <button className="font-mono text-sm font-bold bg-gold/10 border border-gold/30 text-gold rounded-xl px-5 py-2.5 hover:bg-gold/15 transition-colors">
          Take Quiz
        </button>
      </div>
    </div>
  );
}

// ── nearby sites ───────────────────────────────────────────────────────────────

function NearbySitesSection({ nearby }: { nearby: NearbyLocation[] }) {
  if (nearby.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Map size={15} className="text-gold" />
        <h3 className="font-display text-xl text-cream">Nearby Presidential Sites</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nearby.slice(0, 6).map(site => (
          <Link key={site.id} href={`/libraries/${site.id}`}>
            <div className="bg-card border border-border rounded-xl p-4 hover:border-gold/30 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-serif text-sm text-cream truncate group-hover:text-gold transition-colors">
                    {site.name}
                  </p>
                  {site.presidentName && (
                    <p className="font-mono text-xs text-cream/40">{site.presidentName}</p>
                  )}
                  <p className="font-mono text-xs" style={{ color: '#8BBBD4' }}>{site.city}, {site.state}</p>
                </div>
                <span className="font-mono text-[10px] text-gold/60 shrink-0">
                  {Math.round(site.distanceMiles)} mi
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── main export ────────────────────────────────────────────────────────────────

export default function LibraryDetailClient({
  location,
  initialVisits,
  bestTriviaScore,
  nearbyLocations,
}: {
  location: LocationData;
  initialVisits: VisitData[];
  bestTriviaScore: { score: number; completedAt: string } | null;
  nearbyLocations: NearbyLocation[];
}) {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitData[]>(initialVisits);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(
    initialVisits.length > 0 ? 'visit' : 'plan'
  );

  const visited = visits.length > 0;
  const p = location.president;
  const era = p?.era ?? 'modern';
  const eraColor = ERA_COLORS[era] ?? ERA_COLORS.modern;

  const onVisitLogged = useCallback((data: LogVisitSuccessData) => {
    setVisits([{
      id: data.visitId,
      visitDate: data.visitDate,
      notes: data.notes,
      moments: data.moments,
      photos: data.photos,
      weatherTemp: data.weatherTemp,
      weatherConditions: data.weatherConditions,
      weatherWind: null,
    }, ...visits]);
    setShowModal(false);
    setActiveTab('visit');
    router.refresh();
  }, [visits, router]);

  async function deleteVisit(visitId: string) {
    const supabase = createClient();
    await supabase.from('location_visits').delete().eq('id', visitId);
    setVisits(prev => prev.filter(v => v.id !== visitId));
    setShowMenu(false);
    router.refresh();
  }

  const initials = [p?.firstName?.[0], p?.lastName?.[0]].filter(Boolean).join('');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'visit',   label: 'Your Visit',     icon: <Calendar size={14} />  },
    { id: 'plan',    label: 'Plan Visit',      icon: <Check size={14} />     },
    { id: 'dossier', label: 'The Dossier',     icon: <BookOpen size={14} />  },
    { id: 'library', label: 'The Library',     icon: <Building2 size={14} /> },
  ];

  return (
    <>
      {showModal && (
        <LogVisitModal
          locationId={location.id}
          locationName={location.name}
          latitude={location.latitude}
          longitude={location.longitude}
          presidentId={location.president?.id ?? null}
          onClose={() => setShowModal(false)}
          onSuccess={onVisitLogged}
        />
      )}

      <div className="pb-10">

        {/* ── hero ── */}
        {/* outer wrapper: no overflow-hidden so portrait can overlap below */}
        <div className="relative" style={{ height: 380 }}>

          {/* building photo bg — clipped inside hero */}
          <div className="absolute inset-0 overflow-hidden">
            {location.imageUrl ? (
              <img
                src={location.imageUrl}
                alt={location.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #0A1628 0%, #111F33 60%, #0D2040 100%)' }}
              />
            )}
            {/* dark gradient so text is readable */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, #0A1628 100%)' }}
            />
            {/* presidential seal watermark */}
            <img
              src="/presidential-seal.svg"
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-[0.06] pointer-events-none select-none"
            />
            {/* era accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: eraColor }} />
          </div>

          {/* text overlay — bottom-left, right-padded to clear portrait */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pr-36">
            {p?.era && (
              <span
                className="inline-block font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2"
                style={{
                  backgroundColor: eraColor + '4D',
                  color: '#F5F0E8',
                  border: `1px solid ${eraColor}CC`,
                }}
              >
                {ERA_LABELS[p.era] ?? p.era}
              </span>
            )}
            <h1 className="font-display text-4xl md:text-5xl text-white leading-tight mb-1">
              {p?.name ?? location.name}
            </h1>
            {p && (
              <p className="font-mono text-sm mb-3" style={{ color: '#C9A84C' }}>
                {ordinal(p.number)} President of the United States
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {p && (
                <span className="font-mono text-xs bg-black/30 text-cream/70 border border-white/10 rounded-full px-3 py-1">
                  {p.termStart}–{p.termEnd ?? 'present'}
                </span>
              )}
              {p?.party && (
                <span className="font-mono text-xs bg-black/30 text-cream/70 border border-white/10 rounded-full px-3 py-1">
                  {p.party}
                </span>
              )}
              {p?.homeState && (
                <span className="font-mono text-xs bg-black/30 text-cream/70 border border-white/10 rounded-full px-3 py-1">
                  {p.homeState}
                </span>
              )}
            </div>
          </div>

          {/* portrait circle — bottom-right, half-overlapping below hero */}
          <div
            className="absolute z-50"
            style={{ bottom: 0, right: 20, transform: 'translateY(50%)' }}
          >
            <div
              className="w-[120px] h-[120px] rounded-full overflow-hidden"
              style={{
                border: '4px solid #C9A84C',
                boxShadow: '0 0 20px rgba(201, 168, 76, 0.5)',
              }}
            >
              <PortraitImg
                src={p?.portraitUrl}
                alt={p?.name ?? ''}
                className="w-full h-full object-cover object-top"
                fallback={
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: eraColor + '33' }}
                  >
                    <span className="font-mono text-2xl font-bold" style={{ color: eraColor }}>
                      {initials}
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* ── mark visited — full-width button below hero, clearing portrait overlap ── */}
        <div className="px-4 pt-20 pb-2">
          {!visited ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 font-mono text-sm font-bold py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: '#C9A84C', color: '#0A1628' }}
            >
              <Check size={16} /> Mark Visited
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-center gap-2 font-mono text-sm font-bold py-3.5 rounded-xl"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C' }}
            >
              <Check size={16} /> Visited
            </div>
          )}
        </div>

        <div className="px-6 md:px-8 space-y-6 max-w-4xl mx-auto mt-6">

          {/* ── quick stats bar ── */}
          {p && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Term',    value: `${p.termStart}–${p.termEnd ?? 'present'}` },
                { label: 'VP',      value: p.vicePresidents?.[0] ?? '—'              },
                { label: 'Ranked',  value: p.historianRanking ? `#${p.historianRanking}` : '—' },
                { label: 'State',   value: p.homeState ?? '—'                        },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-cream/35 tracking-widest">{label}</span>
                  <span className="font-mono text-xs text-gold">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── secondary actions ── */}
          <div className="flex gap-3 items-center">
            <Link
              href={`/trips?location=${location.id}`}
              className="flex items-center gap-2 border border-border text-cream/60 font-mono text-sm px-5 py-3 rounded-xl hover:border-gold/40 hover:text-gold transition-colors"
            >
              <Map size={15} /> Plan a Trip
            </Link>

            {visited && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-cream/40 hover:text-cream hover:border-cream/30 transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 bg-card border border-border rounded-xl py-1 z-20 min-w-[160px] shadow-xl">
                    <button
                      onClick={() => { setShowModal(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 font-mono text-sm text-cream/60 hover:bg-white/5 hover:text-cream transition-colors"
                    >
                      <Pencil size={13} /> Edit Visit
                    </button>
                    {visits[0] && (
                      <button
                        onClick={() => deleteVisit(visits[0].id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 font-mono text-sm text-red/70 hover:bg-red/5 hover:text-red transition-colors"
                      >
                        <Trash2 size={13} /> Delete Visit
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── location name ── */}
          <div>
            <h2 className="font-display text-xl text-cream">{location.name}</h2>
            <p className="font-mono text-sm text-cream/40">{location.city}, {location.state}</p>
          </div>

          {/* ── tab navigation ── */}
          <div
            className="flex gap-1 overflow-x-auto pb-1 border-b border-border"
            style={{ scrollbarWidth: 'none' }}
          >
            {tabs.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={[
                  'flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs whitespace-nowrap transition-colors border-b-2 -mb-px',
                  activeTab === id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-cream/40 hover:text-cream/70',
                ].join(' ')}
              >
                {icon}
                {label}
                {id === 'visit' && visited && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold ml-0.5" />
                )}
              </button>
            ))}
          </div>

          {/* ── tab content ── */}
          <div>
            {activeTab === 'visit'   && <YourVisitTab visits={visits} />}
            {activeTab === 'plan'    && <PlanVisitTab location={location} />}
            {activeTab === 'dossier' && p && <DossierTab president={p} />}
            {activeTab === 'library' && <LibraryTab location={location} />}
          </div>

          {/* ── trivia ── */}
          {p && (
            <TriviaSection president={p} bestScore={bestTriviaScore} />
          )}

          {/* ── nearby sites ── */}
          <NearbySitesSection nearby={nearbyLocations} />

        </div>
      </div>
    </>
  );
}
