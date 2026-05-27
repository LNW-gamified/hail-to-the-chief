'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ERA_COLORS, ordinal } from '@/lib/era';
import { PortraitImg } from '@/components/ui/portrait-img';
import type { LocationOption } from './trips-client';
import {
  ChevronDown, X, Search, ExternalLink, Pencil, Trash2,
  MoreHorizontal, Check, Plus, Calendar, DollarSign, Ticket,
  MapPin,
} from 'lucide-react';

// ── types ─────────────────────────────────────────────────────────────────────

export type ChecklistItem = {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  suggested: boolean;
};

export type TripStop = {
  id: string;
  stopOrder: number;
  visitDate: string | null;
  ticketSection: string | null;
  ticketRow: string | null;
  ticketSeats: string[] | null;
  ticketConfirmation: string | null;
  estimatedTickets: number;
  actualTickets: number | null;
  estimatedFood: number;
  actualFood: number | null;
  estimatedParking: number;
  actualParking: number | null;
  notes: string | null;
  location: {
    id: string;
    name: string;
    city: string;
    state: string;
    websiteUrl: string | null;
    admission: string | null;
    president: {
      number: number;
      name: string;
      era: string | null;
      portraitUrl: string | null;
    } | null;
  } | null;
  checklists: ChecklistItem[];
};

export type TripCosts = {
  id: string;
  estimatedTravel: number;
  actualTravel: number | null;
  estimatedHotel: number;
  actualHotel: number | null;
};

export type TripDetail = {
  id: string;
  name: string;
  status: 'planned' | 'in_progress' | 'completed';
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  stops: TripStop[];
  costs: TripCosts | null;
};

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  planned:     { label: 'Planned',     color: '#C9A84C', bg: 'rgba(201,168,76,0.15)',  border: 'rgba(201,168,76,0.4)'  },
  in_progress: { label: 'In Progress', color: '#60A5FA', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)'  },
  completed:   { label: 'Completed',   color: '#4ADE80', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)'   },
};

const CHECKLIST_ICONS: Record<string, string> = {
  photos:    '📸',
  exhibits:  '🏛️',
  gift_shop: '🛍️',
  must_do:   '✅',
  learn:     '📝',
};

const DEFAULT_CHECKLIST_ITEMS = [
  { category: 'photos',    item: 'Photograph the exterior' },
  { category: 'exhibits',  item: 'Tour the main exhibit hall' },
  { category: 'gift_shop', item: 'Visit the gift shop' },
  { category: 'must_do',   item: 'Get the library passport stamp' },
  { category: 'learn',     item: 'Learn one new fact about this president' },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtMoney(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  return Math.ceil(
    (new Date(d + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
  );
}

function tripDays(start: string | null, end: string | null) {
  if (!start || !end) return 0;
  return (
    Math.ceil(
      (new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) /
        86_400_000,
    ) + 1
  );
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates TBD';
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  if (!end) return fmt(start);
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (s.getFullYear() === e.getFullYear()) {
    const sStr = new Date(start + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
    return `${sStr} – ${fmt(end)}`;
  }
  return `${fmt(start)} – ${fmt(end)}`;
}

// ── checklist section ─────────────────────────────────────────────────────────

function ChecklistSection({
  stopId,
  items,
  onToggle,
  onAddItem,
}: {
  stopId: string;
  items: ChecklistItem[];
  onToggle: (stopId: string, itemId: string, checked: boolean) => void;
  onAddItem: (stopId: string, category: string, text: string) => void;
}) {
  const [open, setOpen]     = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCat, setNewCat]   = useState('must_do');

  const grouped = useMemo(() => {
    const m = new Map<string, ChecklistItem[]>();
    for (const it of items) {
      const arr = m.get(it.category) ?? [];
      arr.push(it);
      m.set(it.category, arr);
    }
    return m;
  }, [items]);

  const doneCount  = items.filter(i => i.checked).length;
  const totalCount = items.length;

  return (
    <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold" style={{ color: 'rgba(201,168,76,0.8)' }}>
            Don't Forget
          </span>
          <div className="flex gap-1">
            {Object.keys(CHECKLIST_ICONS).map(cat => (
              <span key={cat} style={{ fontSize: 12, opacity: grouped.has(cat) ? 0.9 : 0.25 }}>
                {CHECKLIST_ICONS[cat]}
              </span>
            ))}
          </div>
          {totalCount > 0 && (
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {doneCount}/{totalCount}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'rgba(201,168,76,0.5)' }}
        />
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-3">
          {totalCount === 0 ? (
            <p className="text-xs font-mono py-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No checklist items yet
            </p>
          ) : (
            Array.from(grouped.entries()).map(([cat, catItems]) => (
              <div key={cat}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span style={{ fontSize: 12 }}>{CHECKLIST_ICONS[cat] ?? '📌'}</span>
                  <span className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  >
                    {cat.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1">
                  {catItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => onToggle(stopId, item.id, !item.checked)}
                      className="w-full flex items-start gap-2.5 text-left group/item"
                    >
                      <div
                        className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                        style={{
                          background: item.checked ? '#C9A84C' : 'transparent',
                          border: `1.5px solid ${item.checked ? '#C9A84C' : 'rgba(201,168,76,0.35)'}`,
                        }}
                      >
                        {item.checked && <Check size={9} style={{ color: '#0a1628' }} strokeWidth={3} />}
                      </div>
                      <span
                        className="text-xs font-mono flex-1"
                        style={{
                          color: item.checked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                          textDecoration: item.checked ? 'line-through' : 'none',
                        }}
                      >
                        {item.item}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Add item */}
          <div className="flex gap-2 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <select
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                colorScheme: 'dark',
              }}
            >
              {Object.keys(CHECKLIST_ICONS).map(cat => (
                <option key={cat} value={cat}>
                  {CHECKLIST_ICONS[cat]} {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newItem.trim()) {
                  onAddItem(stopId, newCat, newItem.trim());
                  setNewItem('');
                }
              }}
              placeholder="Add item…"
              className="flex-1 px-2 py-1.5 rounded-lg text-xs font-mono outline-none text-white placeholder:text-white/25"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                caretColor: '#C9A84C',
              }}
            />
            <button
              onClick={() => {
                if (newItem.trim()) {
                  onAddItem(stopId, newCat, newItem.trim());
                  setNewItem('');
                }
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110"
              style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)' }}
            >
              <Plus size={13} style={{ color: '#C9A84C' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── stop budget row ───────────────────────────────────────────────────────────

function StopBudgetRow({
  stop,
  onSave,
}: {
  stop: TripStop;
  onSave: (stopId: string, field: string, value: number) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [vals, setVals] = useState({
    tickets: stop.estimatedTickets,
    food:    stop.estimatedFood,
    parking: stop.estimatedParking,
  });

  const all = [
    { key: 'tickets', label: 'Admission', val: vals.tickets },
    { key: 'food',    label: 'Food',      val: vals.food    },
    { key: 'parking', label: 'Parking',   val: vals.parking },
  ];

  const nonZero = all.filter(r => r.val > 0);

  if (nonZero.length === 0) {
    return (
      <div className="border-t px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setEditing('tickets')}
          className="text-xs font-mono transition-colors hover:text-white"
          style={{ color: 'rgba(201,168,76,0.5)' }}
        >
          + Add Budget
        </button>
      </div>
    );
  }

  return (
    <div className="border-t px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
          Budget
        </span>
        {all.map(({ key, label, val }) => (
          val > 0 || editing === key ? (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                {label}
              </span>
              {editing === key ? (
                <input
                  type="number"
                  autoFocus
                  value={vals[key as keyof typeof vals]}
                  onChange={e => setVals(v => ({ ...v, [key]: parseFloat(e.target.value) || 0 }))}
                  onBlur={() => {
                    onSave(stop.id, key, vals[key as keyof typeof vals]);
                    setEditing(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onSave(stop.id, key, vals[key as keyof typeof vals]);
                      setEditing(null);
                    }
                  }}
                  className="w-16 px-1.5 py-0.5 rounded text-xs font-mono text-white outline-none"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.4)',
                    caretColor: '#C9A84C',
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditing(key)}
                  className="text-xs font-mono transition-colors hover:text-white"
                  style={{ color: '#C9A84C' }}
                >
                  {fmtMoney(val)}
                </button>
              )}
            </div>
          ) : (
            <button
              key={key}
              onClick={() => setEditing(key)}
              className="text-xs font-mono transition-colors hover:text-white"
              style={{ color: 'rgba(201,168,76,0.35)', fontSize: 10 }}
            >
              + {label}
            </button>
          )
        ))}
      </div>
    </div>
  );
}

// ── stop card ─────────────────────────────────────────────────────────────────

function StopCard({
  stop,
  index,
  onChecklistToggle,
  onChecklistAdd,
  onBudgetSave,
  onEditStop,
}: {
  stop: TripStop;
  index: number;
  onChecklistToggle: (stopId: string, itemId: string, checked: boolean) => void;
  onChecklistAdd: (stopId: string, category: string, text: string) => void;
  onBudgetSave: (stopId: string, field: string, value: number) => void;
  onEditStop: (stop: TripStop) => void;
}) {
  const loc  = stop.location;
  const pres = loc?.president;
  const era  = pres?.era ?? null;
  const eraColor = ERA_COLORS[era ?? ''] ?? ERA_COLORS.modern;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#0d1f35',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${eraColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className="text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${eraColor}22`, color: eraColor, border: `1px solid ${eraColor}55`, fontSize: 10 }}
        >
          {index + 1}
        </span>

        <PortraitImg
          src={pres?.portraitUrl}
          alt={pres?.name ?? ''}
          className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
          style={{ border: `1.5px solid ${eraColor}55` }}
          fallback={
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: `${eraColor}22`, border: `1.5px solid ${eraColor}44` }}
            >
              <span className="text-sm font-mono font-bold" style={{ color: eraColor }}>
                {pres?.number ?? '?'}
              </span>
            </div>
          }
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-mono font-bold text-white truncate leading-tight">
            {loc?.name ?? 'Unknown Location'}
          </h3>
          <p className="text-xs font-mono" style={{ color: '#8BBBD4' }}>
            {loc ? `${loc.city}, ${loc.state}` : ''}
            {pres && (
              <span style={{ color: '#8BBBD4' }}>
                {' '}· {ordinal(pres.number)} President
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {loc?.websiteUrl && (
            <a
              href={loc.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all hover:brightness-110"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={11} />
              Tickets
            </a>
          )}
          <button
            onClick={() => onEditStop(stop)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      {/* Visit date */}
      {stop.visitDate && (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-xs font-mono"
          style={{ color: 'rgba(201,168,76,0.7)' }}
        >
          <Calendar size={11} />
          {fmtDate(stop.visitDate)}
        </div>
      )}

      {/* Ticket info */}
      {(stop.ticketSection || stop.ticketRow || (stop.ticketSeats && stop.ticketSeats.length > 0)) && (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-xs font-mono"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <Ticket size={11} style={{ color: 'rgba(201,168,76,0.6)' }} />
          {[
            stop.ticketSection && `Sec ${stop.ticketSection}`,
            stop.ticketRow     && `Row ${stop.ticketRow}`,
            stop.ticketSeats?.length && `Seats ${stop.ticketSeats.join(', ')}`,
          ].filter(Boolean).join(' · ')}
          {stop.ticketConfirmation && (
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>
              {' '}#{stop.ticketConfirmation}
            </span>
          )}
        </div>
      )}

      {/* Admission hint */}
      {loc?.admission && !stop.estimatedTickets && (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-xs font-mono"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <DollarSign size={10} />
          {loc.admission}
        </div>
      )}

      {/* Checklist */}
      <ChecklistSection
        stopId={stop.id}
        items={stop.checklists}
        onToggle={onChecklistToggle}
        onAddItem={onChecklistAdd}
      />

      {/* Budget */}
      <StopBudgetRow stop={stop} onSave={onBudgetSave} />
    </div>
  );
}

// ── budget breakdown ──────────────────────────────────────────────────────────

function BudgetBreakdown({
  stops,
  costs,
  onCostSave,
}: {
  stops: TripStop[];
  costs: TripCosts | null;
  onCostSave: (field: 'travel' | 'hotel', value: number) => void;
}) {
  const [editTravel, setEditTravel] = useState(false);
  const [editHotel,  setEditHotel]  = useState(false);
  const [travel, setTravel] = useState(costs?.estimatedTravel ?? 0);
  const [hotel,  setHotel]  = useState(costs?.estimatedHotel  ?? 0);

  const stopRows = stops.map(s => ({
    id:     s.id,
    label:  (s.location?.name ?? 'Stop').replace(' Presidential Library and Museum', '').replace(' Presidential Library', ''),
    total:  (s.estimatedTickets ?? 0) + (s.estimatedFood ?? 0) + (s.estimatedParking ?? 0),
  })).filter(r => r.total > 0);

  const grandTotal =
    stopRows.reduce((a, r) => a + r.total, 0) + travel + hotel;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0d1f35', border: '1px solid rgba(201,168,76,0.15)' }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
        <h3 className="font-playfair font-bold text-white text-base">Budget Breakdown</h3>
      </div>

      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Stop rows */}
        {stopRows.map(row => (
          <div key={row.id} className="flex items-center justify-between px-5 py-2.5">
            <span className="text-xs font-mono text-white/60 truncate flex-1 mr-4">{row.label}</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#C9A84C' }}>
              {fmtMoney(row.total)}
            </span>
          </div>
        ))}

        {stopRows.length === 0 && (
          <div className="px-5 py-2.5">
            <span className="text-xs font-mono" style={{ color: '#8BBBD4' }}>
              No stop budgets added yet
            </span>
          </div>
        )}

        {/* Travel */}
        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="text-xs font-mono text-white/60">Travel</span>
          {travel > 0 ? (
            editTravel ? (
              <input
                autoFocus
                type="number"
                value={travel}
                onChange={e => setTravel(parseFloat(e.target.value) || 0)}
                onBlur={() => { onCostSave('travel', travel); setEditTravel(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { onCostSave('travel', travel); setEditTravel(false); } }}
                className="w-20 px-2 py-0.5 rounded text-xs font-mono font-bold text-right outline-none"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', caretColor: '#C9A84C' }}
              />
            ) : (
              <button onClick={() => setEditTravel(true)}
                className="text-xs font-mono font-bold" style={{ color: '#C9A84C' }}
              >
                {fmtMoney(travel)}
              </button>
            )
          ) : (
            <button onClick={() => setEditTravel(true)}
              className="text-xs font-mono transition-colors hover:text-white" style={{ color: 'rgba(201,168,76,0.4)' }}
            >
              + Add Budget
            </button>
          )}
        </div>

        {/* Hotel */}
        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="text-xs font-mono text-white/60">Hotel</span>
          {hotel > 0 ? (
            editHotel ? (
              <input
                autoFocus
                type="number"
                value={hotel}
                onChange={e => setHotel(parseFloat(e.target.value) || 0)}
                onBlur={() => { onCostSave('hotel', hotel); setEditHotel(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { onCostSave('hotel', hotel); setEditHotel(false); } }}
                className="w-20 px-2 py-0.5 rounded text-xs font-mono font-bold text-right outline-none"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', caretColor: '#C9A84C' }}
              />
            ) : (
              <button onClick={() => setEditHotel(true)}
                className="text-xs font-mono font-bold" style={{ color: '#C9A84C' }}
              >
                {fmtMoney(hotel)}
              </button>
            )
          ) : (
            <button onClick={() => setEditHotel(true)}
              className="text-xs font-mono transition-colors hover:text-white" style={{ color: 'rgba(201,168,76,0.4)' }}
            >
              + Add Budget
            </button>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: 'rgba(201,168,76,0.05)' }}
        >
          <span className="text-sm font-mono font-bold text-white">Est. Total</span>
          <span className="text-sm font-mono font-bold" style={{ color: '#C9A84C' }}>
            {fmtMoney(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── edit trip modal ───────────────────────────────────────────────────────────

function EditTripModal({
  trip,
  onClose,
  onSaved,
}: {
  trip: TripDetail;
  onClose: () => void;
  onSaved: (updates: Partial<TripDetail>) => void;
}) {
  const supabase  = createClient();
  const [name, setName]     = useState(trip.name);
  const [status, setStatus] = useState(trip.status);
  const [start, setStart]   = useState(trip.startDate ?? '');
  const [end, setEnd]       = useState(trip.endDate   ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await (await import('@/lib/supabase')).createClient()
        .from('trips')
        .update({
          name:       name.trim(),
          status,
          start_date: start || null,
          end_date:   end   || null,
        })
        .eq('id', trip.id);

      onSaved({
        name: name.trim(),
        status,
        startDate: start || null,
        endDate:   end   || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(4,14,28,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1f35', border: '1px solid rgba(201,168,76,0.25)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(201,168,76,0.15)' }}
        >
          <h2 className="font-playfair text-lg font-bold text-white">Edit Trip</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white outline-none"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', caretColor: '#C9A84C' }}
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['planned', 'in_progress', 'completed'] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className="py-2 rounded-lg text-xs font-mono font-bold transition-all"
                  style={{
                    background: status === s ? STATUS_CFG[s].bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${status === s ? STATUS_CFG[s].border : 'rgba(255,255,255,0.1)'}`,
                    color: status === s ? STATUS_CFG[s].color : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Start Date', val: start, set: setStart },
              { label: 'End Date',   val: end,   set: setEnd   },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'rgba(201,168,76,0.8)' }}
                >
                  {label}
                </label>
                <input type="date" value={val} onChange={e => set(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: val ? 'white' : 'rgba(255,255,255,0.3)', colorScheme: 'dark' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-all"
            style={{ background: name.trim() ? '#C9A84C' : 'rgba(201,168,76,0.25)', color: name.trim() ? '#0a1628' : 'rgba(201,168,76,0.35)', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── edit stop modal ───────────────────────────────────────────────────────────

function EditStopModal({
  stop,
  onClose,
  onSaved,
}: {
  stop: TripStop;
  onClose: () => void;
  onSaved: (stopId: string, updates: Partial<TripStop>) => void;
}) {
  const supabase   = createClient();
  const [date, setDate]       = useState(stop.visitDate ?? '');
  const [section, setSection] = useState(stop.ticketSection ?? '');
  const [row, setRow]         = useState(stop.ticketRow ?? '');
  const [seats, setSeats]     = useState((stop.ticketSeats ?? []).join(', '));
  const [confirm, setConfirm] = useState(stop.ticketConfirmation ?? '');
  const [tickets, setTickets] = useState(stop.estimatedTickets);
  const [food, setFood]       = useState(stop.estimatedFood);
  const [parking, setParking] = useState(stop.estimatedParking);
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        visit_date:          date     || null,
        ticket_section:      section  || null,
        ticket_row:          row      || null,
        ticket_seats:        seats.trim() ? seats.split(',').map(s => s.trim()).filter(Boolean) : null,
        ticket_confirmation: confirm  || null,
        estimated_tickets:   tickets,
        estimated_food:      food,
        estimated_parking:   parking,
      };
      await supabase.from('trip_stops').update(updates).eq('id', stop.id);
      onSaved(stop.id, {
        visitDate:          date     || null,
        ticketSection:      section  || null,
        ticketRow:          row      || null,
        ticketSeats:        seats.trim() ? seats.split(',').map(s => s.trim()).filter(Boolean) : null,
        ticketConfirmation: confirm  || null,
        estimatedTickets:   tickets,
        estimatedFood:      food,
        estimatedParking:   parking,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4 overflow-auto"
      style={{ background: 'rgba(4,14,28,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1f35', border: '1px solid rgba(201,168,76,0.25)', maxHeight: '90dvh', overflow: 'auto' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(201,168,76,0.15)' }}
        >
          <div>
            <h2 className="font-playfair font-bold text-white">Edit Stop</h2>
            {stop.location && (
              <p className="text-xs font-mono" style={{ color: 'rgba(201,168,76,0.6)' }}>
                {stop.location.name.replace(' Presidential Library and Museum', '').replace(' Presidential Library', '')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Visit date */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Visit Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: date ? 'white' : 'rgba(255,255,255,0.3)', colorScheme: 'dark' }}
            />
          </div>

          {/* Ticket info */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Ticket Info
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { ph: 'Section',       val: section, set: setSection },
                { ph: 'Row',           val: row,     set: setRow     },
                { ph: 'Seats (A, B…)', val: seats,   set: setSeats   },
                { ph: 'Confirmation #',val: confirm, set: setConfirm },
              ].map(({ ph, val, set }) => (
                <input key={ph} type="text" value={val} onChange={e => set(e.target.value)}
                  placeholder={ph}
                  className="px-3 py-2 rounded-lg text-sm font-mono text-white outline-none placeholder:text-white/25"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', caretColor: '#C9A84C' }}
                />
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Estimated Budget
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admission', val: tickets, set: setTickets },
                { label: 'Food',      val: food,    set: setFood    },
                { label: 'Parking',   val: parking, set: setParking },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className="text-xs font-mono mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                    {label}
                  </p>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono"
                      style={{ color: 'rgba(201,168,76,0.6)' }}
                    >
                      $
                    </span>
                    <input type="number" value={val} onChange={e => set(parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-2 rounded-lg text-sm font-mono text-white outline-none"
                      style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', caretColor: '#C9A84C' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-all"
            style={{ background: '#C9A84C', color: '#0a1628', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Stop'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── add stop modal ────────────────────────────────────────────────────────────

function AddStopModal({
  tripId,
  locations,
  existingStopCount,
  onClose,
  onAdded,
}: {
  tripId: string;
  locations: LocationOption[];
  existingStopCount: number;
  onClose: () => void;
  onAdded: (stop: TripStop) => void;
}) {
  const supabase = createClient();
  const [selected, setSelected] = useState<LocationOption | null>(null);
  const [date, setDate]   = useState('');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return locations
      .filter(l =>
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.presidentName?.toLowerCase() ?? '').includes(q) ||
        l.city.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [locations, query]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const stopOrder = existingStopCount + 1;
      const { data: newStop, error } = await supabase
        .from('trip_stops')
        .insert({
          trip_id:     tripId,
          location_id: selected.id,
          stop_order:  stopOrder,
          visit_date:  date || null,
          estimated_tickets: 0,
          estimated_food:    0,
          estimated_parking: 0,
        })
        .select('id')
        .single();

      if (error || !newStop) throw error;

      // Insert default checklist items
      await supabase.from('stop_checklists').insert(
        DEFAULT_CHECKLIST_ITEMS.map(item => ({
          stop_id:   newStop.id,
          category:  item.category,
          item:      item.item,
          checked:   false,
          suggested: true,
        }))
      );

      // Fetch the inserted checklists
      const { data: checklists } = await supabase
        .from('stop_checklists')
        .select('id, category, item, checked, suggested')
        .eq('stop_id', newStop.id);

      onAdded({
        id:                 newStop.id,
        stopOrder,
        visitDate:          date || null,
        ticketSection:      null,
        ticketRow:          null,
        ticketSeats:        null,
        ticketConfirmation: null,
        estimatedTickets:   0,
        actualTickets:      null,
        estimatedFood:      0,
        actualFood:         null,
        estimatedParking:   0,
        actualParking:      null,
        notes:              null,
        location: {
          id:         selected.id,
          name:       selected.name,
          city:       selected.city,
          state:      selected.state,
          websiteUrl: selected.websiteUrl,
          admission:  null,
          president:  selected.presidentNumber !== null ? {
            number:     selected.presidentNumber,
            name:       selected.presidentName ?? 'Unknown',
            era:        selected.era,
            portraitUrl: selected.portraitUrl,
          } : null,
        },
        checklists: (checklists ?? []) as ChecklistItem[],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(4,14,28,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1f35', border: '1px solid rgba(201,168,76,0.25)', maxHeight: '90dvh', overflow: 'auto' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(201,168,76,0.15)' }}
        >
          <h2 className="font-playfair text-lg font-bold text-white">Add Stop</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Location picker */}
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(201,168,76,0.8)' }}
            >
              Location
            </label>
            {selected ? (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                <PortraitImg src={selected.portraitUrl} alt="" className="w-8 h-8 rounded-full object-cover object-top" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-white truncate">{selected.name}</div>
                  <div className="text-xs font-mono" style={{ color: 'rgba(201,168,76,0.6)' }}>
                    {selected.city}, {selected.state}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 hover:text-red-400 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-t-lg mb-0"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <Search size={13} style={{ color: 'rgba(201,168,76,0.5)' }} />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search locations…"
                    autoFocus
                    className="flex-1 bg-transparent text-sm font-mono text-white outline-none placeholder:text-white/25"
                    style={{ caretColor: '#C9A84C' }}
                  />
                </div>
                <div className="rounded-b-lg overflow-auto"
                  style={{ background: '#0a1628', border: '1px solid rgba(201,168,76,0.2)', borderTop: 'none', maxHeight: 200 }}
                >
                  {filtered.map(loc => (
                    <button key={loc.id} onClick={() => setSelected(loc)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <PortraitImg
                        src={loc.portraitUrl}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0"
                        fallback={
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'rgba(201,168,76,0.15)' }}
                          >
                            <span className="text-xs font-mono font-bold" style={{ color: '#C9A84C' }}>
                              {loc.presidentNumber ?? '?'}
                            </span>
                          </div>
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-white truncate">{loc.name}</div>
                        <div className="font-mono" style={{ fontSize: 10, color: 'rgba(201,168,76,0.55)' }}>
                          {loc.city}, {loc.state} · {loc.tier === 1 ? 'NARA' : loc.tier === 2 ? 'Historic' : 'Experience'}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs font-mono" style={{ color: 'rgba(201,168,76,0.4)' }}>
                      No locations found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Visit date */}
          {selected && (
            <div>
              <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(201,168,76,0.8)' }}
              >
                Planned Visit Date (optional)
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: date ? 'white' : 'rgba(255,255,255,0.3)', colorScheme: 'dark' }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={!selected || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-all"
            style={{
              background: selected ? '#C9A84C' : 'rgba(201,168,76,0.25)',
              color: selected ? '#0a1628' : 'rgba(201,168,76,0.35)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Adding…' : 'Add Stop'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TripDetailClient({
  trip: initialTrip,
  locations,
}: {
  trip: TripDetail;
  locations: LocationOption[];
}) {
  const router  = useRouter();
  const supabase = createClient();

  const [trip, setTrip]             = useState(initialTrip);
  const [showEdit, setShowEdit]     = useState(false);
  const [showAddStop, setAddStop]   = useState(false);
  const [editingStop, setEditStop]  = useState<TripStop | null>(null);
  const [showMenu, setShowMenu]     = useState(false);
  const [deleteState, setDelete]    = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [completing, setCompleting] = useState(false);

  const heroStop = trip.stops[0];
  const heroEra  = heroStop?.location?.president?.era ?? null;
  const eraColor = ERA_COLORS[heroEra ?? ''] ?? ERA_COLORS.modern;

  const days     = daysUntil(trip.startDate);
  const numDays  = tripDays(trip.startDate, trip.endDate);
  const statusCfg = STATUS_CFG[trip.status];

  const totalEstimate = useMemo(() => {
    const stopTotal = trip.stops.reduce(
      (a, s) => a + s.estimatedTickets + s.estimatedFood + s.estimatedParking,
      0,
    );
    const travel = trip.costs?.estimatedTravel ?? 0;
    const hotel  = trip.costs?.estimatedHotel  ?? 0;
    return stopTotal + travel + hotel;
  }, [trip]);

  // ── mutations ────────────────────────────────────────────────────────────────

  const handleMarkComplete = async () => {
    setCompleting(true);
    await supabase.from('trips').update({ status: 'completed' }).eq('id', trip.id);
    setTrip(t => ({ ...t, status: 'completed' }));
    setCompleting(false);
  };

  const handleDelete = async () => {
    setDelete('deleting');
    await supabase.from('trips').delete().eq('id', trip.id);
    router.push('/trips');
  };

  const handleChecklistToggle = useCallback(
    async (stopId: string, itemId: string, checked: boolean) => {
      setTrip(t => ({
        ...t,
        stops: t.stops.map(s =>
          s.id !== stopId
            ? s
            : {
                ...s,
                checklists: s.checklists.map(c =>
                  c.id === itemId ? { ...c, checked } : c,
                ),
              },
        ),
      }));
      await supabase.from('stop_checklists').update({ checked }).eq('id', itemId);
    },
    [supabase],
  );

  const handleChecklistAdd = useCallback(
    async (stopId: string, category: string, text: string) => {
      const { data } = await supabase
        .from('stop_checklists')
        .insert({ stop_id: stopId, category, item: text, checked: false, suggested: false })
        .select('id, category, item, checked, suggested')
        .single();
      if (!data) return;
      setTrip(t => ({
        ...t,
        stops: t.stops.map(s =>
          s.id !== stopId ? s : { ...s, checklists: [...s.checklists, data as ChecklistItem] },
        ),
      }));
    },
    [supabase],
  );

  const handleBudgetSave = useCallback(
    async (stopId: string, field: string, value: number) => {
      const col = field === 'tickets' ? 'estimated_tickets' : field === 'food' ? 'estimated_food' : 'estimated_parking';
      await supabase.from('trip_stops').update({ [col]: value }).eq('id', stopId);
      const fKey = field === 'tickets' ? 'estimatedTickets' : field === 'food' ? 'estimatedFood' : 'estimatedParking';
      setTrip(t => ({
        ...t,
        stops: t.stops.map(s => (s.id !== stopId ? s : { ...s, [fKey]: value })),
      }));
    },
    [supabase],
  );

  const handleCostSave = useCallback(
    async (field: 'travel' | 'hotel', value: number) => {
      if (!trip.costs?.id) return;
      const col = field === 'travel' ? 'estimated_travel' : 'estimated_hotel';
      await supabase.from('trip_costs').update({ [col]: value }).eq('id', trip.costs.id);
      const fKey = field === 'travel' ? 'estimatedTravel' : 'estimatedHotel';
      setTrip(t => ({
        ...t,
        costs: t.costs ? { ...t.costs, [fKey]: value } : t.costs,
      }));
    },
    [supabase, trip.costs?.id],
  );

  const handleStopSaved = useCallback(
    (stopId: string, updates: Partial<TripStop>) => {
      setTrip(t => ({
        ...t,
        stops: t.stops.map(s => (s.id !== stopId ? s : { ...s, ...updates })),
      }));
      setEditStop(null);
    },
    [],
  );

  const handleStopAdded = useCallback((stop: TripStop) => {
    setTrip(t => ({ ...t, stops: [...t.stops, stop] }));
    setAddStop(false);
  }, []);

  return (
    <>
      <div className="min-h-screen" style={{ background: '#040e1c' }}>
        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{
            height: 280,
            background: `linear-gradient(160deg, ${eraColor}66 0%, #0a162840 50%, #040e1c 100%)`,
          }}
        >
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 40%, #040e1c 100%)' }}
          />

          <PortraitImg
            src={heroStop?.location?.president?.portraitUrl}
            alt={heroStop?.location?.president?.name ?? ''}
            className="absolute right-0 bottom-0 h-64 object-contain object-bottom pointer-events-none"
            style={{ filter: `drop-shadow(-8px 0 24px rgba(0,0,0,0.8))` }}
          />

          {/* Back */}
          <Link
            href="/trips"
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-sm transition-all hover:bg-white/15"
            style={{ background: 'rgba(4,14,28,0.6)', color: 'rgba(201,168,76,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            ← Trips
          </Link>

          {/* Trip name */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
              >
                {statusCfg.label}
              </span>
              {trip.startDate && (
                <span className="text-xs font-mono" style={{ color: '#8BBBD4' }}>
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
              )}
            </div>
            <h1 className="font-playfair text-2xl font-bold text-white leading-tight">
              {trip.name}
            </h1>
          </div>
        </div>

        {/* Countdown banner */}
        {trip.status === 'planned' && days !== null && days > 0 && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <div>
              <span className="text-sm font-mono font-bold" style={{ color: '#C9A84C' }}>
                {days} day{days !== 1 ? 's' : ''} until departure
              </span>
              {trip.startDate && (
                <span className="text-xs font-mono ml-2" style={{ color: 'rgba(201,168,76,0.6)' }}>
                  · {fmtDate(trip.startDate)}
                </span>
              )}
            </div>
            <span style={{ fontSize: 22 }}>🗺️</span>
          </div>
        )}

        {trip.status === 'planned' && days === 0 && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <span className="text-sm font-mono font-bold" style={{ color: '#4ADE80' }}>
              Trip starts today — have a great journey! 🎉
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 px-4 mt-4">
          {trip.status !== 'completed' && (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-mono font-bold transition-all hover:brightness-110 active:scale-95"
              style={{ background: '#C9A84C', color: '#0a1628', opacity: completing ? 0.7 : 1 }}
            >
              <Check size={14} strokeWidth={2.5} />
              {completing ? 'Saving…' : 'Mark Complete'}
            </button>
          )}
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-mono font-bold transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <Pencil size={13} />
            Edit Trip
          </button>

          {/* Ellipsis menu */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(m => !m)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <MoreHorizontal size={17} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl overflow-hidden"
                  style={{ background: '#0d1f35', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                >
                  {deleteState === 'idle' ? (
                    <button
                      onClick={() => { setDelete('confirm'); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <Trash2 size={13} className="text-red-400" />
                      <span className="text-sm font-mono text-red-400">Delete Trip</span>
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Delete confirm */}
        {(deleteState === 'confirm' || deleteState === 'deleting') && (
          <div
            className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-center justify-between gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <span className="text-xs font-mono" style={{ color: 'rgba(239,68,68,0.9)' }}>
              Delete "{trip.name}"? This cannot be undone.
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setDelete('idle')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteState === 'deleting'}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                style={{ background: 'rgba(239,68,68,0.25)', color: '#F87171' }}
              >
                {deleteState === 'deleting' ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-4">
          {[
            {
              label: 'Est. Total',
              value: totalEstimate > 0 ? fmtMoney(totalEstimate) : '—',
              icon: <DollarSign size={14} style={{ color: '#C9A84C' }} />,
            },
            {
              label: 'Libraries',
              value: `${trip.stops.length} stop${trip.stops.length !== 1 ? 's' : ''}`,
              icon: <MapPin size={14} style={{ color: '#C9A84C' }} />,
            },
            {
              label: numDays > 0 ? 'Duration' : 'Dates',
              value: numDays > 0 ? `${numDays} days` : 'TBD',
              icon: <Calendar size={14} style={{ color: '#C9A84C' }} />,
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-3 text-center"
              style={{ background: '#0d1f35', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-center mb-1">{icon}</div>
              <div className="text-sm font-mono font-bold text-white">{value}</div>
              <div className="text-xs font-mono" style={{ color: '#8BBBD4', fontSize: 10 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Stops */}
        <div className="px-4 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair font-bold text-white text-lg">Itinerary</h2>
            <button
              onClick={() => setAddStop(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all hover:brightness-110"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              <Plus size={12} />
              Add Stop
            </button>
          </div>

          {trip.stops.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl"
              style={{ border: '1px dashed rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)' }}
            >
              <div className="text-3xl mb-2">📍</div>
              <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
                No stops yet — add your first destination
              </p>
            </div>
          ) : (
            trip.stops.map((stop, i) => (
              <StopCard
                key={stop.id}
                stop={stop}
                index={i}
                onChecklistToggle={handleChecklistToggle}
                onChecklistAdd={handleChecklistAdd}
                onBudgetSave={handleBudgetSave}
                onEditStop={setEditStop}
              />
            ))
          )}
        </div>

        {/* Budget breakdown */}
        <div className="px-4 mt-6 pb-24">
          <BudgetBreakdown stops={trip.stops} costs={trip.costs} onCostSave={handleCostSave} />
        </div>
      </div>

      {showEdit && (
        <EditTripModal
          trip={trip}
          onClose={() => setShowEdit(false)}
          onSaved={updates => { setTrip(t => ({ ...t, ...updates })); setShowEdit(false); }}
        />
      )}

      {showAddStop && (
        <AddStopModal
          tripId={trip.id}
          locations={locations}
          existingStopCount={trip.stops.length}
          onClose={() => setAddStop(false)}
          onAdded={handleStopAdded}
        />
      )}

      {editingStop && (
        <EditStopModal
          stop={editingStop}
          onClose={() => setEditStop(null)}
          onSaved={handleStopSaved}
        />
      )}
    </>
  );
}
