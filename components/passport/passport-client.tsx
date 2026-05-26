'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Download, Trophy } from 'lucide-react';
import { ERA_COLORS } from '@/lib/era';

// ── types ─────────────────────────────────────────────────────────────────────

export type PassportEntry = {
  locationId: string;
  locationName: string;
  city: string;
  state: string;
  tier: number;
  presidentNumber: number | null;
  presidentName: string | null;
  era: string | null;
  visitDate: string | null;
};

type StampTheme = {
  primary: string;   // stamp background
  ink: string;       // text + accent
  symbol: string;    // emoji
  label: string;     // short descriptor shown on stamp
};

// ── stamp themes (per presidential number) ────────────────────────────────────

const STAMP_THEMES: Record<number, StampTheme> = {
  1:  { primary: '#2C3E6A', ink: '#D4AF37', symbol: '🌿', label: 'Founding Father'   },
  2:  { primary: '#2C3E6A', ink: '#D4AF37', symbol: '🏛️', label: 'Second President'  },
  3:  { primary: '#1A3A2A', ink: '#D4AF37', symbol: '🖊️', label: 'Declaration'       },
  4:  { primary: '#2C3E6A', ink: '#D4AF37', symbol: '🕊️', label: 'Father of Const.' },
  5:  { primary: '#2C3E6A', ink: '#D4AF37', symbol: '🌊', label: 'Monroe Doctrine'   },
  6:  { primary: '#1A2A4A', ink: '#C9A84C', symbol: '🏛️', label: 'Old Man Eloquent'  },
  7:  { primary: '#5C3018', ink: '#D4AF37', symbol: '⚔️', label: 'Old Hickory'       },
  8:  { primary: '#2C3E6A', ink: '#D4AF37', symbol: '🌊', label: 'Little Van'        },
  9:  { primary: '#3A2A1A', ink: '#D4AF37', symbol: '🌿', label: 'Tippecanoe'        },
  10: { primary: '#2C3E6A', ink: '#C9A84C', symbol: '🏛️', label: 'His Accidency'     },
  11: { primary: '#1A3A2A', ink: '#D4AF37', symbol: '⭐', label: 'Manifest Destiny'  },
  12: { primary: '#3A2A1A', ink: '#D4AF37', symbol: '⚔️', label: 'Old Rough & Ready' },
  13: { primary: '#2C3E6A', ink: '#C9A84C', symbol: '🏛️', label: 'Compromise of 1850'},
  14: { primary: '#1A2A4A', ink: '#D4AF37', symbol: '🌿', label: 'Handsome Frank'    },
  15: { primary: '#2C3E6A', ink: '#C9A84C', symbol: '🕊️', label: 'Old Buck'          },
  16: { primary: '#1A2A4A', ink: '#D4AF37', symbol: '🎩', label: 'Honest Abe'        },
  17: { primary: '#3A2A1A', ink: '#C9A84C', symbol: '⚒️', label: 'Tennessee Johnson' },
  18: { primary: '#2C4A2C', ink: '#D4AF37', symbol: '⭐', label: 'Unconditional Sur.' },
  19: { primary: '#1A2A4A', ink: '#C9A84C', symbol: '🌿', label: 'Dark Horse'        },
  20: { primary: '#2C3E6A', ink: '#D4AF37', symbol: '🏛️', label: 'Boatman Jim'       },
  21: { primary: '#3A2A3A', ink: '#C9A84C', symbol: '🏛️', label: 'Veto President'    },
  22: { primary: '#1A3A2A', ink: '#D4AF37', symbol: '🌿', label: 'Grover I'          },
  23: { primary: '#2C2A4A', ink: '#C9A84C', symbol: '⭐', label: 'Little Ben'        },
  24: { primary: '#1A3A2A', ink: '#D4AF37', symbol: '🌿', label: 'Grover II'         },
  25: { primary: '#3A2C2A', ink: '#D4AF37', symbol: '⭐', label: 'Idol of Ohio'      },
  26: { primary: '#1B4D2E', ink: '#D4AF37', symbol: '🐻', label: 'Rough Rider'       },
  27: { primary: '#2A3A1A', ink: '#C9A84C', symbol: '⚖️', label: 'Big Bill Taft'     },
  28: { primary: '#1A2A4A', ink: '#D4AF37', symbol: '🕊️', label: 'Schoolmaster'      },
  29: { primary: '#3A2C1A', ink: '#C9A84C', symbol: '🌾', label: 'Normalcy'          },
  30: { primary: '#2C3E2A', ink: '#D4AF37', symbol: '🌿', label: 'Silent Cal'        },
  31: { primary: '#5C4A2A', ink: '#F0D080', symbol: '🌾', label: 'The Engineer'      },
  32: { primary: '#7A1919', ink: '#F0E8D0', symbol: '📻', label: 'New Deal'          },
  33: { primary: '#9B1C2A', ink: '#FFFFFF', symbol: '⭐', label: 'The Buck'          },
  34: { primary: '#3A5A3A', ink: '#D4AF37', symbol: '🎖️', label: 'D-Day General'    },
  35: { primary: '#002868', ink: '#BF0A30', symbol: '🕊️', label: 'Camelot'          },
  36: { primary: '#5C3018', ink: '#D4A84C', symbol: '🤠', label: 'Great Society'    },
  37: { primary: '#5A1A2A', ink: '#E8D5B0', symbol: '✌️', label: 'Silent Majority'  },
  38: { primary: '#1A3A6A', ink: '#FFCB05', symbol: '🏛️', label: 'Healer in Chief'  },
  39: { primary: '#1A5A1A', ink: '#D4A84C', symbol: '🌿', label: 'Peacemaker'       },
  40: { primary: '#9B1C2A', ink: '#FFFFFF', symbol: '✈️', label: 'Morning in America'},
  41: { primary: '#1A2A6A', ink: '#D4A84C', symbol: '🌊', label: 'Thousand Points'  },
  42: { primary: '#3A0A5A', ink: '#D4AF37', symbol: '🎷', label: 'Bridge Builder'   },
  43: { primary: '#5C2A0A', ink: '#D4A84C', symbol: '🌵', label: 'The Decider'      },
  44: { primary: '#001A4A', ink: '#BF0A30', symbol: '🌅', label: 'Yes We Can'       },
  45: { primary: '#9B1C2A', ink: '#001A4A', symbol: '🦅', label: 'America First'    },
  46: { primary: '#1A2A5A', ink: '#D4AF37', symbol: '🤝', label: 'Restore the Soul' },
  47: { primary: '#C41E3A', ink: '#002868', symbol: '🦅', label: 'MAGA'             },
};

const DEFAULT_THEME: StampTheme = {
  primary: '#1A3A5C', ink: '#C9A84C', symbol: '🏛️', label: 'Presidential Library',
};

function getTheme(n: number | null): StampTheme {
  if (!n) return DEFAULT_THEME;
  return STAMP_THEMES[n] ?? DEFAULT_THEME;
}

// ── eagle seal SVG ────────────────────────────────────────────────────────────

function EagleSeal({ size = 80 }: { size?: number }) {
  const s = 13;
  const stars = Array.from({ length: s }, (_, i) => {
    const a = ((i * 360) / s - 90) * (Math.PI / 180);
    return { x: 50 + 44 * Math.cos(a), y: 50 + 44 * Math.sin(a) };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="#C9A84C" strokeWidth="0.6" opacity="0.5" />

      {/* 13 stars */}
      {stars.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="2.2" fill="#C9A84C" opacity="0.85" />
      ))}

      {/* Wings */}
      <path
        d="M 12,54 C 18,38 37,44 50,50 C 63,44 82,38 88,54 C 78,49 63,52 50,56 C 37,52 22,49 12,54 Z"
        fill="#C9A84C"
        opacity="0.92"
      />
      {/* Body */}
      <ellipse cx="50" cy="62" rx="10" ry="12" fill="#C9A84C" opacity="0.92" />
      {/* Head */}
      <circle cx="50" cy="40" r="9" fill="#C9A84C" opacity="0.92" />
      {/* Beak */}
      <path d="M 55,41 L 63,44 L 55,47 Z" fill="rgba(10,22,40,0.6)" />
      {/* Eye */}
      <circle cx="53" cy="39" r="1.8" fill="rgba(10,22,40,0.7)" />
      {/* Chest shield */}
      <path d="M 44,52 L 56,52 L 56,64 L 50,70 L 44,64 Z"
        fill="rgba(0,40,104,0.85)" stroke="#C9A84C" strokeWidth="0.6" />
      <line x1="50" y1="52" x2="50" y2="70" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
      {/* Talons / arrows suggestion */}
      <line x1="36" y1="70" x2="44" y2="66" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
      <line x1="56" y1="66" x2="64" y2="70" stroke="#C9A84C" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ── stamp animation keyframes ─────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes stamp-press {
  0%   { transform: translateY(-28px) scale(0.75) rotate(-3deg); opacity: 0; }
  55%  { transform: translateY(5px)   scale(1.04) rotate(0deg);  opacity: 1; }
  75%  { transform: translateY(-3px)  scale(0.98) rotate(0deg); }
  100% { transform: translateY(0)     scale(1)    rotate(0deg); }
}
@keyframes ink-burst {
  0%   { opacity: 0.8; transform: scale(0.4); }
  40%  { opacity: 0.5; }
  100% { opacity: 0;   transform: scale(1.8); }
}
@keyframes new-stamp {
  0%   { transform: translateY(-50px) scale(0.6) rotate(-8deg); opacity: 0; }
  45%  { transform: translateY(8px)   scale(1.08) rotate(1deg); opacity: 1; box-shadow: 0 0 0 0 rgba(191,10,48,0.7); }
  60%  { box-shadow: 0 0 0 18px rgba(191,10,48,0.2); }
  75%  { transform: translateY(-4px)  scale(0.97) rotate(0deg);  box-shadow: 0 0 0 28px rgba(191,10,48,0); }
  100% { transform: translateY(0)     scale(1)    rotate(0deg); }
}
@keyframes placeholder-fade {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
`;

// ── NARA passport stamp ───────────────────────────────────────────────────────

function NaraStamp({
  entry,
  index,
  isNew,
}: {
  entry: PassportEntry;
  index: number;
  isNew: boolean;
}) {
  const theme = getTheme(entry.presidentNumber);
  const earned = !!entry.visitDate;
  const eraColor = ERA_COLORS[entry.era ?? 'modern'] ?? '#C9A84C';
  const lastName = entry.presidentName?.split(' ').pop() ?? '???';

  const visitLabel = entry.visitDate
    ? new Date(entry.visitDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', year: 'numeric',
      })
    : null;

  const serialNo = `US${String(entry.presidentNumber ?? 0).padStart(2, '0')}-${
    entry.city.slice(0, 2).toUpperCase()
  }`;

  const wrapperStyle: React.CSSProperties = earned
    ? isNew
      ? { animation: 'new-stamp 0.65s cubic-bezier(0.34,1.56,0.64,1) 200ms both' }
      : { animation: `stamp-press 0.55s cubic-bezier(0.34,1.56,0.64,1) ${index * 70}ms both` }
    : { animation: `placeholder-fade 0.4s ease ${index * 40 + 200}ms both`, opacity: 0 };

  return (
    <div className="relative select-none" style={wrapperStyle}>
      {/* Ink burst (new stamp only) */}
      {isNew && earned && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none z-20"
          style={{
            background: 'radial-gradient(circle, rgba(191,10,48,0.45) 0%, transparent 70%)',
            animation: 'ink-burst 0.7s ease-out 250ms both',
          }}
        />
      )}

      {/* Stamp body */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: earned ? theme.primary : '#111E2E',
          border: `2px dashed ${earned ? theme.ink + '70' : '#2A3A4A'}`,
          aspectRatio: '3 / 4',
          opacity: earned ? 1 : 0.35,
        }}
      >
        {/* Era accent top bar */}
        {earned && (
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: eraColor }}
          />
        )}

        {/* Inner border */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 7,
            borderRadius: 3,
            border: `1px solid ${earned ? theme.ink + '35' : '#2A3A4A'}`,
          }}
        />

        <div className="relative h-full flex flex-col px-2 pt-3 pb-2">
          {/* Header row: serial no + USA */}
          <div className="flex justify-between items-start shrink-0">
            <span
              className="font-mono leading-none"
              style={{ fontSize: 7, color: theme.ink, opacity: 0.55 }}
            >
              {earned ? serialNo : '· · ·'}
            </span>
            <span
              className="font-mono font-bold leading-none"
              style={{ fontSize: 7, color: theme.ink, opacity: 0.7 }}
            >
              {earned ? 'USA' : '???'}
            </span>
          </div>

          {/* Symbol */}
          <div className="flex-1 flex items-center justify-center">
            {earned ? (
              <span className="text-3xl" role="img" aria-hidden="true">
                {theme.symbol}
              </span>
            ) : (
              <span
                className="font-display text-2xl"
                style={{ color: '#3A4A5A' }}
              >
                {entry.presidentNumber ?? '?'}
              </span>
            )}
          </div>

          {/* Name block */}
          <div className="text-center shrink-0 space-y-0.5">
            <p
              className="font-display leading-tight truncate"
              style={{ fontSize: 10, color: earned ? theme.ink : '#3A4A5A' }}
            >
              {earned ? lastName : (entry.presidentName?.split(' ').pop() ?? '?????')}
            </p>
            {earned ? (
              <>
                <p
                  className="font-mono leading-none"
                  style={{ fontSize: 7, color: theme.ink, opacity: 0.6 }}
                >
                  {entry.city}, {entry.state}
                </p>
                {visitLabel && (
                  <p
                    className="font-mono font-bold leading-none"
                    style={{ fontSize: 7, color: theme.ink, opacity: 0.9 }}
                  >
                    {visitLabel}
                  </p>
                )}
              </>
            ) : (
              <p
                className="font-mono leading-none"
                style={{ fontSize: 7, color: '#3A4A5A' }}
              >
                NOT YET
              </p>
            )}
          </div>
        </div>

        {/* "OFFICIAL" diagonal watermark on earned stamps */}
        {earned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="absolute"
              style={{
                transform: 'rotate(-28deg) translateY(-8px)',
                border: `1.5px solid ${eraColor}50`,
                borderRadius: 2,
                padding: '1px 8px',
              }}
            >
              <span
                className="font-mono font-bold tracking-[0.18em]"
                style={{ fontSize: 7, color: eraColor + '55' }}
              >
                OFFICIAL
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── historic site mini-stamp ──────────────────────────────────────────────────

function HistoricStamp({ entry, index }: { entry: PassportEntry; index: number }) {
  const theme = getTheme(entry.presidentNumber);
  const earned = !!entry.visitDate;
  const lastName = entry.presidentName?.split(' ').pop() ?? '???';
  const visitLabel = entry.visitDate
    ? new Date(entry.visitDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', year: '2-digit',
      })
    : null;

  return (
    <div
      className="relative select-none"
      style={
        earned
          ? { animation: `stamp-press 0.5s cubic-bezier(0.34,1.56,0.64,1) ${index * 45 + 400}ms both` }
          : { animation: `placeholder-fade 0.3s ease ${index * 25 + 400}ms both`, opacity: 0 }
      }
    >
      <div
        className="relative rounded-md overflow-hidden"
        style={{
          background: earned ? theme.primary : '#0E1A27',
          border: `1.5px dashed ${earned ? theme.ink + '60' : '#1E2E3E'}`,
          aspectRatio: '3 / 4',
          opacity: earned ? 1 : 0.3,
        }}
      >
        {/* Inner border */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 5,
            borderRadius: 2,
            border: `0.75px solid ${earned ? theme.ink + '30' : '#1E2E3E'}`,
          }}
        />

        <div className="relative h-full flex flex-col items-center justify-between px-1 py-1.5">
          <span
            className="font-mono leading-none"
            style={{ fontSize: 6, color: theme.ink, opacity: 0.5 }}
          >
            {earned ? 'USA' : '· ·'}
          </span>

          <span className="text-lg" role="img" aria-hidden="true">
            {earned ? theme.symbol : ''}
          </span>

          <div className="text-center">
            <p
              className="font-display leading-none truncate w-full"
              style={{ fontSize: 7, color: earned ? theme.ink : '#2A3A4A' }}
            >
              {earned ? lastName : '?????'}
            </p>
            {visitLabel && (
              <p
                className="font-mono leading-none mt-0.5"
                style={{ fontSize: 6, color: theme.ink, opacity: 0.7 }}
              >
                {visitLabel}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── share canvas ──────────────────────────────────────────────────────────────

async function generateShareImage(
  naraEntries: PassportEntry[],
  displayName: string,
  passportNo: string,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  const W = 840;
  const H = 1060;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#040E1C';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid texture
  ctx.strokeStyle = 'rgba(201,168,76,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Header border
  ctx.strokeStyle = 'rgba(201,168,76,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = 'rgba(201,168,76,0.10)';
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 13px "Georgia", serif';
  ctx.fillText('UNITED STATES OF AMERICA', W / 2, 62);

  ctx.font = 'bold 32px "Georgia", serif';
  ctx.fillText('PRESIDENTIAL PASSPORT', W / 2, 102);

  // Divider
  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(60, 116);
  ctx.lineTo(W - 60, 116);
  ctx.stroke();

  // User info
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(201,168,76,0.65)';
  ctx.textAlign = 'left';
  ctx.fillText(`HOLDER: ${displayName.toUpperCase()}`, 60, 138);
  ctx.fillText(`PASSPORT NO. ${passportNo}`, 60, 155);

  // Stamps grid (3 cols × 5 rows)
  const COLS = 3;
  const SW = 220;
  const SH = 285;
  const GAP = 18;
  const gridLeft = (W - (COLS * SW + (COLS - 1) * GAP)) / 2;
  const gridTop = 175;

  for (let i = 0; i < 15; i++) {
    const entry = naraEntries[i] ?? null;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = gridLeft + col * (SW + GAP);
    const y = gridTop + row * (SH + GAP);

    const theme = entry ? getTheme(entry.presidentNumber) : DEFAULT_THEME;
    const earned = !!entry?.visitDate;

    // Stamp background
    ctx.fillStyle = earned ? theme.primary : '#0D1A27';
    ctx.globalAlpha = earned ? 1 : 0.35;
    roundRect(ctx, x, y, SW, SH, 8);
    ctx.fill();

    // Dashed border
    ctx.globalAlpha = earned ? 0.6 : 0.2;
    ctx.strokeStyle = earned ? theme.ink : '#2A3A4A';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    roundRect(ctx, x, y, SW, SH, 8);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1;

    if (!entry || !earned) {
      // Placeholder number
      ctx.font = 'bold 48px "Georgia", serif';
      ctx.fillStyle = 'rgba(42,58,74,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(entry?.presidentNumber?.toString() ?? '?', x + SW / 2, y + SH / 2 + 18);
      continue;
    }

    // Symbol emoji
    ctx.font = '54px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.symbol, x + SW / 2, y + SH * 0.46);

    // President last name
    ctx.font = 'bold 18px "Georgia", serif';
    ctx.fillStyle = theme.ink;
    const lastName = entry.presidentName?.split(' ').pop() ?? '?';
    ctx.fillText(lastName, x + SW / 2, y + SH * 0.64);

    // City, state
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = theme.ink;
    ctx.globalAlpha = 0.65;
    ctx.fillText(`${entry.city}, ${entry.state}`, x + SW / 2, y + SH * 0.74);

    // Visit date
    if (entry.visitDate) {
      const d = new Date(entry.visitDate + 'T00:00:00');
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.globalAlpha = 0.9;
      ctx.fillText(label, x + SW / 2, y + SH * 0.83);
    }

    // OFFICIAL diagonal watermark
    ctx.save();
    ctx.translate(x + SW / 2, y + SH / 2);
    ctx.rotate(-0.48);
    ctx.strokeStyle = ERA_COLORS[entry.era ?? 'modern'] + '50';
    ctx.lineWidth = 1;
    ctx.strokeRect(-36, -10, 72, 20);
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillStyle = ERA_COLORS[entry.era ?? 'modern'] + '60';
    ctx.globalAlpha = 1;
    ctx.fillText('OFFICIAL', 0, 5);
    ctx.restore();
  }

  // Progress
  const earned = naraEntries.filter(e => e.visitDate).length;
  const total = 15;
  ctx.textAlign = 'center';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#C9A84C';
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${earned} OF ${total} OFFICIAL SEALS COLLECTED`, W / 2, H - 54);

  // Progress bar
  const barW = 400;
  const barX = (W - barW) / 2;
  const barY = H - 46;
  ctx.fillStyle = '#1A2A3A';
  ctx.globalAlpha = 1;
  roundRect(ctx, barX, barY, barW, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#C9A84C';
  roundRect(ctx, barX, barY, (barW * earned) / total, 6, 3);
  ctx.fill();

  // Watermark
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = '#C9A84C';
  ctx.globalAlpha = 0.2;
  ctx.fillText('★  HAIL TO THE CHIEF  ★', W / 2, H - 34);

  ctx.globalAlpha = 1;

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── sound ─────────────────────────────────────────────────────────────────────

function playStampSound() {
  try {
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++) {
      const t = i / buf.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5) * 0.9;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close();
  } catch {
    // AudioContext blocked — silently ignore
  }
}

// ── main export ────────────────────────────────────────────────────────────────

export default function PassportClient({
  naraEntries,
  historicEntries,
  displayName,
  passportNo,
}: {
  naraEntries: PassportEntry[];
  historicEntries: PassportEntry[];
  displayName: string;
  passportNo: string;
}) {
  const [newStampId, setNewStampId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const visitedNara = naraEntries.filter(e => e.visitDate).length;
  const visitedHistoric = historicEntries.filter(e => e.visitDate).length;
  const totalNara = 15;
  const progressPct = Math.round((visitedNara / totalNara) * 100);

  // Detect newly-earned stamp from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hailToTheChief.newStamp');
      if (raw) {
        setNewStampId(raw);
        localStorage.removeItem('hailToTheChief.newStamp');
        // Scroll to the stamp after a short delay for the animation
        setTimeout(() => {
          document.getElementById(`nara-stamp-${raw}`)?.scrollIntoView({
            behavior: 'smooth', block: 'center',
          });
          playStampSound();
        }, 200);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const blob = await generateShareImage(naraEntries, displayName, passportNo);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presidential-passport-${passportNo}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setSharing(false);
    }
  }, [naraEntries, displayName, passportNo]);

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="pb-12 max-w-2xl mx-auto">

        {/* ── passport cover ── */}
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #020B18, #040E1C 60%, #071428)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.18)',
          }}
        >
          {/* Cover header */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center border-b border-gold/10">
            <EagleSeal size={72} />

            <p className="font-mono text-[11px] tracking-[0.25em] text-gold/60 mt-4">
              UNITED STATES OF AMERICA
            </p>

            <h1
              className="font-display text-2xl md:text-3xl mt-1"
              style={{
                background: 'linear-gradient(to bottom, #F0D060, #C9A84C, #9A7828)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Presidential Passport
            </h1>

            <div
              className="w-32 h-px my-4"
              style={{ background: 'linear-gradient(to right, transparent, #C9A84C60, transparent)' }}
            />

            {/* Holder info */}
            <div className="w-full max-w-xs text-left space-y-1.5 font-mono text-xs">
              {[
                ['HOLDER',       displayName],
                ['PASSPORT NO.', passportNo],
                ['ISSUED BY',    'Hail to the Chief'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-gold/35 w-28 shrink-0 tracking-wide">{label}</span>
                  <span className="text-gold/80">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stamp pages interior */}
          <div className="px-4 py-6 md:px-6">

            {/* Section label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gold/10" />
              <p className="font-mono text-[10px] tracking-[0.3em] text-gold/40">
                OFFICIAL PRESIDENTIAL SEALS
              </p>
              <div className="h-px flex-1 bg-gold/10" />
            </div>

            {/* 3 × N stamp grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {naraEntries.map((entry, i) => (
                <div key={entry.locationId} id={`nara-stamp-${entry.locationId}`}>
                  <NaraStamp
                    entry={entry}
                    index={i}
                    isNew={entry.locationId === newStampId}
                  />
                </div>
              ))}
              {/* Pad to a multiple of 3 with empty slots */}
              {Array.from({ length: (3 - (naraEntries.length % 3)) % 3 }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="rounded-lg"
                  style={{
                    aspectRatio: '3 / 4',
                    background: '#0a1628',
                    border: '2px dashed rgba(42,58,74,0.4)',
                  }}
                />
              ))}
            </div>

            {/* Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-gold/60" />
                  <span className="font-mono text-xs text-gold/60">
                    {visitedNara} of {totalNara} stamps collected
                  </span>
                </div>
                <span className="font-mono text-xs text-gold/40">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-navy-secondary">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(to right, #9A7828, #C9A84C, #F0D060)',
                  }}
                />
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              disabled={sharing || visitedNara === 0}
              className="mt-5 w-full flex items-center justify-center gap-2 font-mono text-sm py-3 rounded-xl border transition-colors disabled:opacity-40"
              style={{
                borderColor: 'rgba(201,168,76,0.3)',
                color: '#C9A84C',
                background: 'rgba(201,168,76,0.05)',
              }}
            >
              <Download size={15} />
              {sharing ? 'Generating…' : 'Download Passport Image'}
            </button>

          </div>
        </div>

        {/* ── historic sites section ── */}
        {historicEntries.length > 0 && (
          <div className="mx-4 mt-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <p className="font-mono text-[10px] tracking-[0.25em] text-cream/25">
                HISTORIC SITES {visitedHistoric > 0 ? `— ${visitedHistoric} VISITED` : ''}
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
              {historicEntries.map((entry, i) => (
                <HistoricStamp key={entry.locationId} entry={entry} index={i} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
