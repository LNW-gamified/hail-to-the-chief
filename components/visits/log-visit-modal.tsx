'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X, ChevronLeft, Check, Camera, Building2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { logVisit, type EarnedAchievement, type LogVisitResult } from '@/app/actions/log-visit';

// ── types ─────────────────────────────────────────────────────────────────────

type LocationOption = {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  presidentId: string | null;
};

export type LogVisitSuccessData = {
  visitId: string;
  visitDate: string;
  notes: string | null;
  moments: string[] | null;
  photos: string[] | null;
  weatherTemp: string | null;
  weatherConditions: string | null;
};

type Phase = 'step1' | 'step2' | 'step3' | 'loading' | 'success';

export type LogVisitModalProps = {
  locationId?: string;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
  presidentId?: string | null;
  onClose: () => void;
  onSuccess: (data: LogVisitSuccessData) => void;
};

// ── moments config ────────────────────────────────────────────────────────────

const MOMENTS: { key: string; emoji: string; label: string }[] = [
  { key: '🦅 Saw the Presidential Portrait',  emoji: '🦅', label: 'Saw the Presidential Portrait'   },
  { key: '🏛️ Visited Replica Oval Office',    emoji: '🏛️', label: 'Visited Replica Oval Office'     },
  { key: '✈️ Boarded Air Force One',          emoji: '✈️', label: 'Boarded Air Force One (Reagan)'  },
  { key: '📼 Heard Presidential Recordings',  emoji: '📼', label: 'Heard Presidential Recordings'   },
  { key: '🎟️ Got Passport Stamped',           emoji: '🎟️', label: 'Got Passport Stamped'            },
  { key: '🛍️ Visited Gift Shop',             emoji: '🛍️', label: 'Visited Gift Shop'               },
  { key: '🧠 Did Interactive Exhibit',        emoji: '🧠', label: 'Did Interactive Exhibit'         },
  { key: '👨‍👩‍👧 Brought Family',              emoji: '👨‍👩‍👧', label: 'Brought Family'                  },
  { key: '📚 Did Research in Archives',       emoji: '📚', label: 'Did Research in Archives'        },
  { key: '🎤 Attended Special Event',         emoji: '🎤', label: 'Attended Special Event'          },
  { key: '🌧️ Rain or Bad Weather',            emoji: '🌧️', label: 'Rain or Bad Weather'             },
  { key: '🏃 Rushed — Need to Return',        emoji: '🏃', label: 'Rushed — Need to Return'         },
  { key: '❤️ Deeply Moving Experience',       emoji: '❤️', label: 'Deeply Moving Experience'        },
  { key: '📸 Got Great Photos',               emoji: '📸', label: 'Got Great Photos'                },
];

// ── weather emoji helper ──────────────────────────────────────────────────────

function weatherEmoji(conditions: string): string {
  const c = conditions.toLowerCase();
  if (c.includes('clear')) return '☀️';
  if (c.includes('mainly clear') || c.includes('mainly')) return '🌤️';
  if (c.includes('cloud') || c.includes('overcast')) return '⛅';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog')) return '🌫️';
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return '🌧️';
  return '🌤️';
}

// ── seat pill input ────────────────────────────────────────────────────────────

function SeatPillInput({
  seats,
  onChange,
}: {
  seats: string[];
  onChange: (s: string[]) => void;
}) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  function commit() {
    const s = val.trim().toUpperCase();
    if (s && !seats.includes(s)) onChange([...seats, s]);
    setVal('');
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center bg-navy border border-border rounded-lg px-3 py-2 min-h-[42px] cursor-text focus-within:border-gold transition-colors"
      onClick={() => ref.current?.focus()}
    >
      {seats.map(s => (
        <span
          key={s}
          className="flex items-center gap-1 bg-gold/15 border border-gold/30 text-gold font-mono text-xs px-2 py-0.5 rounded-full"
        >
          {s}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(seats.filter(x => x !== s)); }}
            className="text-gold/50 hover:text-gold leading-none"
          >×</button>
        </span>
      ))}
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); commit(); }
          if (e.key === 'Backspace' && !val && seats.length) onChange(seats.slice(0, -1));
        }}
        onBlur={commit}
        className="bg-transparent outline-none text-cream font-mono text-sm flex-1 min-w-[60px] placeholder-cream/20 py-0.5"
        placeholder={seats.length === 0 ? 'A1, B12…' : ''}
      />
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
        <div className="absolute inset-0 rounded-full border-[3px] border-gold/50 border-dashed animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border-2 border-gold/40 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[9px] text-gold/60 tracking-widest leading-none">★</span>
          <span className="font-mono text-[10px] font-bold text-gold tracking-widest leading-tight mt-1">
            VISITED
          </span>
          <span className="font-mono text-[9px] text-gold/70 leading-none mt-0.5">{month} {day}</span>
          <span className="font-mono text-[9px] text-gold/50 leading-none">{year}</span>
        </div>
      </div>
      <p className="font-mono text-[10px] text-cream/30 tracking-widest">PRESIDENTIAL PASSPORT</p>
    </div>
  );
}

// ── step dots ─────────────────────────────────────────────────────────────────

function StepDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1.5 mt-1.5">
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className="w-5 h-1.5 rounded-full transition-colors duration-200"
          style={{ background: n <= current ? '#C9A84C' : 'rgba(201,168,76,0.15)' }}
        />
      ))}
    </div>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export default function LogVisitModal({
  locationId: initLocId,
  locationName: initLocName,
  latitude: initLat,
  longitude: initLon,
  presidentId: initPresId,
  onClose,
  onSuccess,
}: LogVisitModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Phase
  const [phase, setPhase] = useState<Phase>('step1');

  // Location (when not pre-filled)
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedLocId, setSelectedLocId] = useState(initLocId ?? '');

  // Step 1
  const [visitDate, setVisitDate] = useState(today);

  // Step 2
  const [ticketSection, setTicketSection] = useState('');
  const [ticketRow, setTicketRow] = useState('');
  const [ticketSeats, setTicketSeats] = useState<string[]>([]);
  const [ticketConfirmation, setTicketConfirmation] = useState('');
  const [moments, setMoments] = useState<Set<string>>(new Set());

  // Step 3
  const [notes, setNotes] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Results
  const [result, setResult] = useState<LogVisitResult | null>(null);
  const [savedNotes, setSavedNotes] = useState('');
  const [savedMoments, setSavedMoments] = useState<string[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Fetch NARA locations when modal is used from home page (no pre-filled loc)
  useEffect(() => {
    if (initLocId) return;
    createClient()
      .from('presidential_locations')
      .select('id, name, city, state, latitude, longitude, president_id')
      .eq('tier', 1)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setLocations(data.map(l => ({
            id: l.id,
            name: l.name,
            city: l.city,
            state: l.state,
            latitude: l.latitude != null ? Number(l.latitude) : null,
            longitude: l.longitude != null ? Number(l.longitude) : null,
            presidentId: l.president_id,
          })));
        }
      });
  }, [initLocId]);

  function goTo(p: Phase) {
    setPhase(p);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function toggleMoment(key: string) {
    setMoments(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function addPhotos(files: File[]) {
    const combined = [...photoFiles, ...files].slice(0, 5);
    const prevs = combined.map((f, i) =>
      i < photoFiles.length ? photoPreviews[i] : URL.createObjectURL(f),
    );
    setPhotoFiles(combined);
    setPhotoPreviews(prevs);
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(photoPreviews[i]);
    setPhotoFiles(f => f.filter((_, j) => j !== i));
    setPhotoPreviews(p => p.filter((_, j) => j !== i));
  }

  async function handleSubmit() {
    setError('');
    goTo('loading');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Upload photos to Supabase Storage
    const photoUrls: string[] = [];
    if (user && photoFiles.length > 0) {
      const ts = Date.now();
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `${user.id}/${ts}_${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('visit-photos')
          .upload(path, file, { upsert: true });
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('visit-photos')
            .getPublicUrl(path);
          photoUrls.push(publicUrl);
        }
      }
    }

    // Resolve location lat/lon + presidentId when user selected from dropdown
    let lat = initLat ?? null;
    let lon = initLon ?? null;
    let presId = initPresId ?? null;
    const locationId = initLocId ?? selectedLocId;
    if (!initLocId) {
      const loc = locations.find(l => l.id === selectedLocId);
      if (loc) { lat = loc.latitude; lon = loc.longitude; presId = loc.presidentId; }
    }

    try {
      const res = await logVisit({
        locationId,
        visitDate,
        ticketSection: ticketSection || undefined,
        ticketRow: ticketRow || undefined,
        ticketSeats: ticketSeats.length ? ticketSeats : undefined,
        ticketConfirmation: ticketConfirmation || undefined,
        moments: moments.size ? [...moments] : undefined,
        notes: notes || undefined,
        photoUrls: photoUrls.length ? photoUrls : undefined,
        presidentId: presId,
        latitude: lat,
        longitude: lon,
      });

      if (res.error) {
        setError(res.error);
        goTo('step3');
        return;
      }

      setResult(res);
      setSavedNotes(notes);
      setSavedMoments([...moments]);
      setSavedPhotos(photoUrls);
      goTo('success');
    } catch {
      setError('Something went wrong. Please try again.');
      goTo('step3');
    }
  }

  const displayName = initLocId
    ? (initLocName ?? 'This Library')
    : locations.find(l => l.id === selectedLocId)?.name ?? '';

  const step = phase === 'step1' ? 1 : phase === 'step2' ? 2 : 3;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div
        ref={scrollRef}
        className="relative w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border-t sm:border border-border sm:rounded-2xl rounded-t-2xl"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >

        {/* ── sticky header (shown during steps) ────────────────────────────── */}
        {(phase === 'step1' || phase === 'step2' || phase === 'step3') && (
          <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4 flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] text-gold/60 tracking-[0.2em]">
                {phase === 'step1' && 'STEP 1 OF 3 — WHEN & WHERE'}
                {phase === 'step2' && 'STEP 2 OF 3 — YOUR EXPERIENCE'}
                {phase === 'step3' && 'STEP 3 OF 3 — NOTES & PHOTOS'}
              </p>
              <StepDots current={step as 1 | 2 | 3} />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-navy border border-border flex items-center justify-center text-cream/40 hover:text-cream transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── loading ────────────────────────────────────────────────────────── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 px-6 gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
            <div className="text-center">
              <p className="font-mono text-sm text-cream/70">Logging your visit…</p>
              <p className="font-mono text-xs text-cream/30 mt-1">Fetching weather data</p>
            </div>
          </div>
        )}

        {/* ── step 1: library + date ─────────────────────────────────────────── */}
        {phase === 'step1' && (
          <div className="p-5 space-y-5">
            {/* Library */}
            <div>
              <label className="block font-mono text-[10px] text-cream/50 mb-1.5 tracking-widest">
                LIBRARY
              </label>
              {initLocId ? (
                <div className="flex items-center gap-3 bg-navy border border-border rounded-lg px-4 py-3">
                  <Building2 size={15} className="text-gold/50 shrink-0" />
                  <span className="font-serif text-sm text-cream">{initLocName ?? 'Selected Library'}</span>
                </div>
              ) : (
                <select
                  value={selectedLocId}
                  onChange={e => setSelectedLocId(e.target.value)}
                  className="w-full bg-navy border border-border rounded-lg px-4 py-3 text-cream font-serif text-sm focus:outline-none focus:border-gold transition-colors"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    appearance: 'none',
                  }}
                >
                  <option value="">Select a library…</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.city}, {l.state}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block font-mono text-[10px] text-cream/50 mb-1.5 tracking-widest">
                DATE OF VISIT
              </label>
              <input
                type="date"
                value={visitDate}
                max={today}
                min="2000-01-01"
                onChange={e => setVisitDate(e.target.value)}
                className="w-full bg-navy border border-border rounded-lg px-4 py-3 text-cream font-mono text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 font-mono text-sm text-cream/50 border border-border rounded-xl py-3 hover:border-cream/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => goTo('step2')}
                disabled={!(initLocId ?? selectedLocId) || !visitDate}
                className="flex-[2] font-mono text-sm font-bold bg-gold text-navy rounded-xl py-3 hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── step 2: experience ─────────────────────────────────────────────── */}
        {phase === 'step2' && (
          <div className="p-5 space-y-6">
            {/* Ticket info */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] text-cream/40 tracking-widest">
                TICKET INFO <span className="text-cream/25">(OPTIONAL)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[9px] text-cream/35 mb-1 tracking-wider">SECTION</label>
                  <input
                    type="text"
                    value={ticketSection}
                    onChange={e => setTicketSection(e.target.value)}
                    placeholder="A"
                    className="w-full bg-navy border border-border rounded-lg px-3 py-2.5 text-cream font-mono text-sm focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-cream/35 mb-1 tracking-wider">ROW</label>
                  <input
                    type="text"
                    value={ticketRow}
                    onChange={e => setTicketRow(e.target.value)}
                    placeholder="5"
                    className="w-full bg-navy border border-border rounded-lg px-3 py-2.5 text-cream font-mono text-sm focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[9px] text-cream/35 mb-1 tracking-wider">SEATS</label>
                <SeatPillInput seats={ticketSeats} onChange={setTicketSeats} />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-cream/35 mb-1 tracking-wider">CONFIRMATION #</label>
                <input
                  type="text"
                  value={ticketConfirmation}
                  onChange={e => setTicketConfirmation(e.target.value)}
                  placeholder="ABC-12345"
                  className="w-full bg-navy border border-border rounded-lg px-3 py-2.5 text-cream font-mono text-sm focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                />
              </div>
            </div>

            {/* Moments */}
            <div>
              <p className="font-mono text-[10px] text-cream/40 tracking-widest mb-3">
                MOMENTS <span className="text-cream/25">(TAP ALL THAT APPLY)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MOMENTS.map(m => {
                  const active = moments.has(m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => toggleMoment(m.key)}
                      className="text-left px-3 py-2.5 rounded-xl border transition-all"
                      style={{
                        background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.02)',
                        borderColor: active ? 'rgba(201,168,76,0.5)' : 'rgba(30,58,95,0.8)',
                        color: active ? '#C9A84C' : 'rgba(245,240,232,0.45)',
                      }}
                    >
                      <span className="mr-1.5">{m.emoji}</span>
                      <span className="font-serif text-xs leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => goTo('step1')}
                className="flex items-center gap-1.5 font-mono text-sm text-cream/50 border border-border rounded-xl py-3 px-4 hover:border-cream/30 transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => goTo('step3')}
                className="flex-1 font-mono text-sm font-bold bg-gold text-navy rounded-xl py-3 hover:bg-gold/90 transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── step 3: notes + photos ─────────────────────────────────────────── */}
        {phase === 'step3' && (
          <div className="p-5 space-y-5">
            <div>
              <label className="block font-mono text-[10px] text-cream/50 mb-1.5 tracking-widest">
                NOTES <span className="text-cream/25">(OPTIONAL)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="What stood out? Any personal reflections…"
                className="w-full bg-navy border border-border rounded-lg px-4 py-3 text-cream font-serif text-sm placeholder-cream/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-cream/50 mb-1.5 tracking-widest">
                PHOTOS <span className="text-cream/25">(OPTIONAL · UP TO 5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white flex items-center justify-center font-bold text-xs leading-none"
                    >×</button>
                  </div>
                ))}
                {photoFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
                    style={{ borderColor: 'rgba(201,168,76,0.25)', color: 'rgba(245,240,232,0.3)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(201,168,76,0.6)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.25)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.3)';
                    }}
                  >
                    <Camera size={18} />
                    <span className="font-mono text-[9px]">Add Photo</span>
                  </button>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files ?? []);
                  addPhotos(files);
                  e.target.value = '';
                }}
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-red bg-red/10 border border-red/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => goTo('step2')}
                className="flex items-center gap-1.5 font-mono text-sm text-cream/50 border border-border rounded-xl py-3 px-4 hover:border-cream/30 transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 font-mono text-sm font-bold bg-gold text-navy rounded-xl py-3 hover:bg-gold/90 transition-colors"
              >
                <Check size={15} /> Log Visit
              </button>
            </div>
          </div>
        )}

        {/* ── success ────────────────────────────────────────────────────────── */}
        {phase === 'success' && result && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)' }}
              >
                <Check size={22} className="text-gold" />
              </div>
              <h3 className="font-display text-2xl text-cream">Visit Logged!</h3>
              {displayName && (
                <p className="font-mono text-xs text-cream/40 mt-1">
                  {displayName}
                </p>
              )}
              <p className="font-mono text-xs text-gold/60 mt-0.5">
                {new Date(result.visitDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>

            {/* Passport stamp */}
            <div
              className="rounded-2xl p-6 flex flex-col items-center gap-2 border border-border"
              style={{ background: 'rgba(10,22,40,0.6)' }}
            >
              <p className="font-mono text-[10px] text-cream/25 tracking-widest mb-1">
                PASSPORT STAMPED
              </p>
              <PassportStamp visitDate={result.visitDate} />
            </div>

            {/* Weather */}
            {result.weather && (result.weather.temp || result.weather.conditions) && (
              <div className="flex items-center gap-3 bg-navy/60 border border-border rounded-xl px-4 py-3">
                <span className="text-2xl leading-none">
                  {weatherEmoji(result.weather.conditions)}
                </span>
                <div>
                  <p className="font-mono text-sm text-cream">
                    {[result.weather.temp, result.weather.conditions].filter(Boolean).join(' · ')}
                  </p>
                  <p className="font-mono text-[9px] text-cream/30 tracking-widest mt-0.5">
                    WEATHER ON YOUR VISIT DAY
                  </p>
                </div>
              </div>
            )}

            {/* Historic date */}
            {result.isHistoricDate && result.historicNote && (
              <div
                className="rounded-xl px-4 py-3 border"
                style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}
              >
                <p className="font-mono text-[10px] text-gold/60 tracking-widest mb-1.5">
                  ★ HISTORIC DATE
                </p>
                <p className="font-serif text-sm text-cream/80 leading-relaxed">{result.historicNote}</p>
              </div>
            )}

            {/* Achievements */}
            {result.earnedAchievements.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-cream/30 tracking-widest">
                  NEW ACHIEVEMENTS UNLOCKED
                </p>
                {result.earnedAchievements.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-navy/60 border rounded-xl px-4 py-3"
                    style={{ borderColor: 'rgba(201,168,76,0.25)' }}
                  >
                    <span className="text-xl leading-none">{a.icon}</span>
                    <span className="font-display text-sm text-cream flex-1">{a.name}</span>
                    <span className="font-mono text-xs text-gold font-bold">+{a.points} XP</span>
                  </div>
                ))}
              </div>
            )}

            {/* Done */}
            <button
              type="button"
              onClick={() =>
                onSuccess({
                  visitId: result.visitId,
                  visitDate: result.visitDate,
                  notes: savedNotes || null,
                  moments: savedMoments.length ? savedMoments : null,
                  photos: savedPhotos.length ? savedPhotos : null,
                  weatherTemp: result.weather?.temp ?? null,
                  weatherConditions: result.weather?.conditions ?? null,
                })
              }
              className="w-full font-mono text-sm font-bold bg-gold text-navy rounded-xl py-3.5 hover:bg-gold/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
