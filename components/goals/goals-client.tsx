'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Zap, Hand, Trophy, BookOpen, ChevronRight, X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { ERA_COLORS } from '@/lib/era';

// ── exported types ────────────────────────────────────────────────────────────

export type GoalEntry = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  trackingType: 'auto_visit' | 'manual_once' | 'manual_repeatable' | 'quiz';
  earnedAt: string | null;
  progressCurrent: number;
  progressMax: number;
  claimCount: number;
};

export type QuizEntry = {
  locationId: string;
  locationName: string;
  city: string;
  state: string;
  presidentId: string;
  presidentNumber: number;
  presidentName: string;
  presidentEra: string | null;
  portraitUrl: string | null;
  bestScore: number | null;
  completedAt: string | null;
};

export type RankInfo = {
  level: number;
  title: string;
  nextTitle: string | null;
  xp: number;
  progressPct: number;
  xpToNext: number | null;
};

// ── constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'all',        label: 'All',        emoji: '⭐' },
  { id: 'trail',      label: 'The Trail',  emoji: '🏛️' },
  { id: 'geography',  label: 'Geography',  emoji: '🗺️' },
  { id: 'historical', label: 'Historical', emoji: '📜' },
  { id: 'experience', label: 'Experience', emoji: '🏆' },
  { id: 'knowledge',  label: 'Knowledge',  emoji: '🧠' },
  { id: 'journal',    label: 'Journal',    emoji: '✍️' },
  { id: 'legendary',  label: 'Legendary',  emoji: '🌟' },
];

const CATEGORY_COLORS: Record<string, string> = {
  trail:      '#C9A84C',
  geography:  '#3A8ABF',
  historical: '#B22234',
  experience: '#7B4FBE',
  knowledge:  '#3A8A3A',
  journal:    '#C07820',
  legendary:  '#E0C060',
};

const KEYFRAMES = `
@keyframes gold-shine {
  0%   { transform: translateX(-200%) skewX(-20deg); }
  100% { transform: translateX(400%)  skewX(-20deg); }
}
@keyframes progress-fill {
  0%   { width: 0%; }
}
@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.35); }
  50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
}
@keyframes confetti-fall {
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@keyframes medal-fly-up {
  0%   { transform: translateY(80px) scale(0.5); opacity: 0; }
  60%  { transform: translateY(-10px) scale(1.08); opacity: 1; }
  80%  { transform: translateY(4px)   scale(0.97); }
  100% { transform: translateY(0)     scale(1); }
}
@keyframes shield-pulse {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(201,168,76,0.3)); }
  50%       { filter: drop-shadow(0 0 18px rgba(201,168,76,0.6)); }
}
@keyframes progress-bar-fill {
  from { width: 0; }
}
`;

// ── rank shield ────────────────────────────────────────────────────────────────

function RankShield({ level }: { level: number }) {
  const gold  = '#C9A84C';
  const goldL = '#F0D060';
  const bg0   = '#040E1C';

  const rays = level >= 5
    ? Array.from({ length: 16 }, (_, i) => {
        const a = ((i * 360) / 16) * (Math.PI / 180) - Math.PI / 2;
        return { x1: 60 + 42 * Math.cos(a), y1: 70 + 42 * Math.sin(a),
                 x2: 60 + 55 * Math.cos(a), y2: 70 + 55 * Math.sin(a) };
      })
    : [];

  return (
    <svg
      viewBox="0 0 120 145"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'shield-pulse 3s ease-in-out infinite' }}
    >
      <defs>
        <linearGradient id="shBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={level >= 4 ? '#0F1E30' : bg0} />
          <stop offset="100%" stopColor={bg0} />
        </linearGradient>
        <linearGradient id="shGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={goldL} />
          <stop offset="50%"  stopColor={gold}  />
          <stop offset="100%" stopColor="#8B6010" />
        </linearGradient>
        {level >= 6 && (
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>

      {/* Outer rays for level 5-6 */}
      {rays.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
          stroke={gold} strokeWidth="1.2" opacity="0.35" />
      ))}

      {/* Shield outer */}
      <path
        d="M 60 6 L 112 26 L 112 78 Q 112 122 60 138 Q 8 122 8 78 L 8 26 Z"
        fill="url(#shBg)"
        stroke="url(#shGold)"
        strokeWidth={level >= 6 ? 2.5 : 2}
        filter={level >= 6 ? 'url(#glow)' : undefined}
      />

      {/* Inner border — level 2+ */}
      {level >= 2 && (
        <path d="M 60 16 L 102 32 L 102 78 Q 102 114 60 128 Q 18 114 18 78 L 18 32 Z"
          fill="none" stroke={gold} strokeWidth="0.7" opacity="0.4" />
      )}

      {/* Inner-inner border — level 3+ */}
      {level >= 3 && (
        <path d="M 60 26 L 92 38 L 92 78 Q 92 106 60 118 Q 28 106 28 78 L 28 38 Z"
          fill="none" stroke={gold} strokeWidth="0.5" opacity="0.25" />
      )}

      {/* Stars at top — level 3+ */}
      {level >= 3 && [30, 60, 90].map((x, i) => (
        <text key={i} x={x} y="48" fontSize="9" textAnchor="middle"
          fill={goldL} opacity={level >= 5 ? 0.85 : 0.5}>★</text>
      ))}

      {/* Central symbol */}
      <text x="60" y="98" fontSize={level >= 4 ? 40 : 32}
        textAnchor="middle" dominantBaseline="middle">
        {level >= 6 ? '🦅' : level >= 4 ? '🦅' : level >= 3 ? '📜' : level >= 2 ? '🏛️' : '📚'}
      </text>

      {/* Bottom trim line — level 4+ */}
      {level >= 4 && (
        <path d="M 35 118 Q 60 132 85 118" fill="none" stroke={gold}
          strokeWidth="1" opacity="0.5" />
      )}

      {/* Level 6 outer ring of dots */}
      {level >= 6 && Array.from({ length: 24 }, (_, i) => {
        const a = ((i * 360) / 24) * (Math.PI / 180);
        const r = 58;
        return (
          <circle key={i} cx={60 + r * Math.cos(a)} cy={70 + r * Math.sin(a)}
            r="1.5" fill={goldL} opacity="0.55" />
        );
      })}
    </svg>
  );
}

// ── confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#B22234', '#FFFFFF', '#3C3B6E', '#C9A84C', '#F0D060', '#E8E8E8'];

function ConfettiOverlay({
  achievement,
  onDismiss,
}: {
  achievement: GoalEntry;
  onDismiss: () => void;
}) {
  const particles = useMemo(() =>
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left:     Math.random() * 100,
      size:     5 + Math.random() * 9,
      delay:    Math.random() * 1.8,
      duration: 2.2 + Math.random() * 2,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape:    Math.random() > 0.4 ? 'rect' : 'circle',
    })),
    [],
  );

  const catColor = CATEGORY_COLORS[achievement.category] ?? '#C9A84C';

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center"
      style={{ background: 'rgba(4,14,28,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed pointer-events-none"
          style={{
            left:       `${p.left}%`,
            top:        '-20px',
            width:      p.size,
            height:     p.shape === 'rect' ? p.size * 0.5 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            background: p.color,
            animation:  `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}

      {/* Medal card */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 px-8 pt-8 pb-6 rounded-2xl max-w-xs w-full mx-6"
        style={{
          background: `linear-gradient(135deg, #0F1E2F, ${catColor}18, #0F1E2F)`,
          border: `2px solid ${catColor}60`,
          animation: 'medal-fly-up 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: `0 0 40px ${catColor}30`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: `linear-gradient(135deg, ${catColor}30, ${catColor}15)`,
            border: `2px solid ${catColor}60`,
            boxShadow: `0 0 24px ${catColor}40`,
          }}
        >
          {achievement.icon}
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-cream/40 mb-1">
            ACHIEVEMENT UNLOCKED
          </p>
          <h3 className="font-display text-xl text-cream">{achievement.name}</h3>
          <p className="font-serif text-sm text-cream/60 mt-1">{achievement.description}</p>
          <div
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full font-mono text-xs font-bold"
            style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}
          >
            +{achievement.points} XP
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="font-mono text-xs text-cream/40 hover:text-cream/70 transition-colors mt-1"
        >
          Tap anywhere to dismiss
        </button>
      </div>
    </div>
  );
}

// ── manual log modal ───────────────────────────────────────────────────────────

function ManualLogModal({
  achievement,
  onClose,
  onSuccess,
}: {
  achievement: GoalEntry;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [notes, setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert claim
      const { error: claimErr } = await supabase.from('achievement_claims').insert({
        user_id:       user.id,
        achievement_id: achievement.id,
        claim_date:    new Date().toISOString().split('T')[0],
        notes:         notes || null,
      });
      if (claimErr) throw claimErr;

      // Insert earned record if first time
      if (!achievement.earnedAt) {
        await supabase.from('user_achievements').insert({
          user_id:         user.id,
          achievement_id:  achievement.id,
          manually_claimed: true,
        });
        // Signal new achievement for confetti
        try { localStorage.setItem('hailToTheChief.newAchievement', achievement.id); } catch { /* ignore */ }
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <h3 className="font-display text-lg text-cream">{achievement.name}</h3>
            <p className="font-mono text-xs text-gold/60">+{achievement.points} XP</p>
          </div>
        </div>
        <form onSubmit={handleLog} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-cream/40 mb-1.5 tracking-wide">NOTES (OPTIONAL)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-navy border border-border rounded-lg px-4 py-3 text-cream font-serif text-sm placeholder-cream/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
              placeholder="Add a note about this experience..."
            />
          </div>
          {error && (
            <p className="font-mono text-xs text-red bg-red/10 border border-red/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 font-mono text-sm text-cream/50 border border-border rounded-xl py-3 hover:border-cream/30 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 font-mono text-sm font-bold bg-gold text-navy rounded-xl py-3 hover:bg-gold/90 transition-colors disabled:opacity-50">
              {loading ? 'Logging…' : 'Log It'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── achievement card ───────────────────────────────────────────────────────────

function AchievementCard({
  goal,
  onLog,
}: {
  goal: GoalEntry;
  onLog: (g: GoalEntry) => void;
}) {
  const earned    = !!goal.earnedAt;
  const pct       = goal.progressMax > 0 ? Math.min(1, goal.progressCurrent / goal.progressMax) : 0;
  const inProgress = !earned && pct > 0;
  const locked     = !earned && pct === 0;
  const catColor   = CATEGORY_COLORS[goal.category] ?? '#C9A84C';
  const isManual   = goal.trackingType === 'manual_once' || goal.trackingType === 'manual_repeatable';
  const isRepeat   = goal.trackingType === 'manual_repeatable';

  const earnedLabel = goal.earnedAt
    ? new Date(goal.earnedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className="relative rounded-xl overflow-hidden flex flex-col"
      style={{
        opacity:    locked ? 0.45 : 1,
        background: earned
          ? `linear-gradient(135deg, #3D2608, #6B4010, #A87428, #C9A84C, #A87428, #6B4010)`
          : 'linear-gradient(135deg, #0F1E2F, #081220)',
        border: `1px solid ${earned ? catColor + '60' : inProgress ? catColor + '30' : 'rgba(42,58,74,0.8)'}`,
        boxShadow: earned ? `0 4px 24px ${catColor}18` : undefined,
        animation: inProgress ? 'pulse-gold 2.5s ease-in-out infinite' : undefined,
      }}
    >
      {/* Gold shine sweep on earned */}
      {earned && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <div
            className="absolute top-0 bottom-0 w-16"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)',
              animation: 'gold-shine 3.5s ease-in-out 0.5s infinite',
            }}
          />
        </div>
      )}

      {/* Category color top bar */}
      <div className="h-0.5" style={{ background: catColor, opacity: earned ? 1 : 0.4 }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          {/* Icon + type badge */}
          <div className="relative">
            <span className="text-2xl">{goal.icon}</span>
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: earned ? catColor : '#1A2A3A', border: '1px solid rgba(0,0,0,0.3)' }}
              title={isManual ? 'Manual' : 'Auto-tracked'}
            >
              {isManual
                ? <Hand size={8} style={{ color: earned ? '#0A1628' : catColor }} />
                : <Zap  size={8} style={{ color: earned ? '#0A1628' : catColor }} />
              }
            </span>
          </div>

          {/* Points badge */}
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: earned ? 'rgba(0,0,0,0.25)' : `${catColor}15`,
              color:      earned ? '#F0D060'           : catColor,
              border:     `1px solid ${earned ? 'rgba(240,208,96,0.3)' : catColor + '30'}`,
            }}
          >
            {goal.points} XP
          </span>
        </div>

        {/* Name */}
        <div className="flex-1">
          <h4
            className="font-display text-sm leading-tight"
            style={{ color: earned ? '#F0D060' : 'rgba(245,240,220,0.9)' }}
          >
            {goal.name}
          </h4>
          <p
            className="font-serif text-xs mt-1 leading-relaxed"
            style={{ color: earned ? 'rgba(240,208,96,0.7)' : 'rgba(245,240,220,0.45)' }}
          >
            {goal.description}
          </p>
        </div>

        {/* Footer */}
        <div className="space-y-2">
          {/* Earned date */}
          {earned && earnedLabel && (
            <div className="flex items-center gap-1.5">
              <Check size={11} style={{ color: '#F0D060' }} />
              <span className="font-mono text-[10px]" style={{ color: 'rgba(240,208,96,0.7)' }}>
                Earned {earnedLabel}
              </span>
            </div>
          )}

          {/* In-progress bar */}
          {inProgress && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-cream/40">
                  {goal.progressCurrent} / {goal.progressMax}
                </span>
                <span className="font-mono text-[10px]" style={{ color: catColor }}>
                  {Math.round(pct * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-navy-secondary overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct * 100}%`,
                    background: `linear-gradient(to right, ${catColor}80, ${catColor})`,
                    animation: 'progress-bar-fill 1s ease-out both',
                  }}
                />
              </div>
            </div>
          )}

          {/* Locked indicator */}
          {locked && !isManual && (
            <div className="flex items-center gap-1.5">
              <Lock size={11} className="text-cream/20" />
              <span className="font-mono text-[10px] text-cream/25">Not started</span>
            </div>
          )}

          {/* Repeatable claim count */}
          {isRepeat && goal.claimCount > 0 && (
            <span className="font-mono text-[10px] text-cream/40">
              Logged {goal.claimCount}×
            </span>
          )}

          {/* Manual log button */}
          {isManual && !earned && (
            <button
              onClick={() => onLog(goal)}
              className="w-full font-mono text-xs font-bold py-2 rounded-lg transition-colors mt-1"
              style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}40` }}
            >
              Log Achievement
            </button>
          )}
          {isRepeat && earned && (
            <button
              onClick={() => onLog(goal)}
              className="w-full font-mono text-xs py-1.5 rounded-lg transition-colors"
              style={{ color: catColor, border: `1px solid ${catColor}25` }}
            >
              Log Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── quiz card ─────────────────────────────────────────────────────────────────

function QuizCard({ entry }: { entry: QuizEntry }) {
  const eraColor = ERA_COLORS[entry.presidentEra ?? 'modern'] ?? '#C9A84C';
  const initials = entry.presidentName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const taken    = entry.bestScore !== null;
  const perfect  = entry.bestScore === 10;

  return (
    <div
      className="relative rounded-xl overflow-hidden p-4 flex flex-col gap-3"
      style={{
        background: taken
          ? `linear-gradient(135deg, ${eraColor}12, #0F1E2F)`
          : '#0A1628',
        border: `1px solid ${taken ? eraColor + '30' : 'rgba(42,58,74,0.6)'}`,
        opacity: taken ? 1 : 0.75,
      }}
    >
      {/* Era accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: eraColor }} />

      {/* Portrait */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center border-2"
          style={{ borderColor: eraColor + '50', background: eraColor + '15' }}
        >
          {entry.portraitUrl ? (
            <img src={entry.portraitUrl} alt={entry.presidentName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-sm font-bold" style={{ color: eraColor }}>{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm text-cream truncate">{entry.presidentName}</p>
          <p className="font-mono text-[10px] text-cream/35">{entry.city}, {entry.state}</p>
        </div>
      </div>

      {/* Score */}
      {taken ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl" style={{ color: eraColor }}>
              {entry.bestScore}/10
            </span>
            {perfect && (
              <span className="font-mono text-[9px] bg-gold/15 text-gold border border-gold/30 rounded-full px-2 py-0.5">
                💯 PERFECT
              </span>
            )}
          </div>
          <Link
            href={`/libraries/${entry.locationId}?tab=quiz`}
            className="font-mono text-[11px] px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: eraColor, border: `1px solid ${eraColor}30` }}
          >
            Retry
          </Link>
        </div>
      ) : (
        <Link
          href={`/libraries/${entry.locationId}?tab=quiz`}
          className="flex items-center justify-between font-mono text-sm font-bold py-2.5 px-4 rounded-xl transition-colors"
          style={{ background: `${eraColor}15`, color: eraColor, border: `1px solid ${eraColor}35` }}
        >
          Take Quiz <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ── active challenges (briefing doc) ──────────────────────────────────────────

function ActiveChallenges({ goals }: { goals: GoalEntry[] }) {
  const active = goals
    .filter(g => !g.earnedAt && g.progressCurrent > 0 && g.progressMax > 0 &&
                 g.trackingType !== 'manual_once')
    .sort((a, b) =>
      (b.progressCurrent / b.progressMax) - (a.progressCurrent / a.progressMax),
    )
    .slice(0, 3);

  if (active.length === 0) return null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#080F1A',
        border: '1px solid rgba(178,34,52,0.3)',
      }}
    >
      {/* Briefing header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(178,34,52,0.12)', borderBottom: '1px solid rgba(178,34,52,0.2)' }}
      >
        <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
        <p className="font-mono text-xs font-bold tracking-[0.25em] text-red/80">
          ▌ ACTIVE INTEL — CURRENT MISSIONS
        </p>
      </div>

      <div className="p-4 space-y-4">
        {active.map((g, i) => {
          const pct      = g.progressCurrent / g.progressMax;
          const catColor = CATEGORY_COLORS[g.category] ?? '#C9A84C';
          return (
            <div key={g.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cream/25 w-4">{i + 1}.</span>
                  <span className="text-lg">{g.icon}</span>
                  <div>
                    <p className="font-display text-sm text-cream">{g.name}</p>
                    <p className="font-mono text-[10px] text-cream/40">
                      {g.progressCurrent} / {g.progressMax}
                    </p>
                  </div>
                </div>
                <span
                  className="font-mono text-xs font-bold shrink-0"
                  style={{ color: catColor }}
                >
                  {Math.round(pct * 100)}%
                </span>
              </div>
              {/* Nearly-full progress bar */}
              <div className="h-2 rounded-full overflow-hidden bg-navy ml-7">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct * 100}%`,
                    background: `linear-gradient(to right, ${catColor}60, ${catColor})`,
                    animation: 'progress-bar-fill 1s ease-out both',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── main export ────────────────────────────────────────────────────────────────

export default function GoalsClient({
  goals,
  quizEntries,
  rankInfo,
}: {
  goals: GoalEntry[];
  quizEntries: QuizEntry[];
  rankInfo: RankInfo;
}) {
  const router = useRouter();
  const [category, setCategory]           = useState('all');
  const [logTarget, setLogTarget]         = useState<GoalEntry | null>(null);
  const [newAchievement, setNewAchievement] = useState<GoalEntry | null>(null);

  // Check for newly unlocked achievement from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hailToTheChief.newAchievement');
      if (raw) {
        const found = goals.find(g => g.id === raw && g.earnedAt);
        if (found) setNewAchievement(found);
        localStorage.removeItem('hailToTheChief.newAchievement');
      }
    } catch { /* ignore */ }
  }, [goals]);

  const filtered = useMemo(() => {
    const base = category === 'all' ? goals : goals.filter(g => g.category === category);
    // Sort: earned first → in-progress by pct → locked
    return [...base].sort((a, b) => {
      const ae = a.earnedAt ? 1 : 0;
      const be = b.earnedAt ? 1 : 0;
      if (ae !== be) return be - ae;
      const ap = a.progressMax > 0 ? a.progressCurrent / a.progressMax : 0;
      const bp = b.progressMax > 0 ? b.progressCurrent / b.progressMax : 0;
      return bp - ap;
    });
  }, [goals, category]);

  const earned     = goals.filter(g => !!g.earnedAt).length;
  const inProgress = goals.filter(g => !g.earnedAt && g.progressCurrent > 0).length;
  const total      = goals.length;

  const handleLogSuccess = useCallback(() => {
    setLogTarget(null);
    router.refresh();
  }, [router]);

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Confetti overlay for new achievement */}
      {newAchievement && (
        <ConfettiOverlay
          achievement={newAchievement}
          onDismiss={() => setNewAchievement(null)}
        />
      )}

      {/* Manual log modal */}
      {logTarget && (
        <ManualLogModal
          achievement={logTarget}
          onClose={() => setLogTarget(null)}
          onSuccess={handleLogSuccess}
        />
      )}

      <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto pb-16">

        {/* ── hero: rank display ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #040E1C, #081220)',
            border: '1px solid rgba(201,168,76,0.18)',
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
            {/* Shield */}
            <div className="w-28 h-28 md:w-36 md:h-36 shrink-0">
              <RankShield level={rankInfo.level} />
            </div>

            {/* Rank info */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <p className="font-mono text-[11px] tracking-[0.3em] text-gold/40 mb-1">
                CURRENT RANK
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-cream">{rankInfo.title}</h2>

              {rankInfo.nextTitle && (
                <p className="font-mono text-xs text-cream/35 mt-1">
                  Next: <span className="text-gold/60">{rankInfo.nextTitle}</span>
                  {rankInfo.xpToNext && ` — ${rankInfo.xpToNext} XP needed`}
                </p>
              )}

              {/* XP bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between font-mono text-xs text-cream/35">
                  <span>{rankInfo.xp.toLocaleString()} XP</span>
                  {rankInfo.xpToNext && (
                    <span>Commander in Chief</span>
                  )}
                </div>
                <div className="h-3 rounded-full bg-navy-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${rankInfo.progressPct}%`,
                      background: 'linear-gradient(to right, #9A7828, #C9A84C, #F0D060)',
                      animation: 'progress-bar-fill 1.4s ease-out both',
                    }}
                  />
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {[
                  { label: 'Earned',      value: earned,     color: '#C9A84C' },
                  { label: 'In Progress', value: inProgress, color: '#3A8ABF' },
                  { label: 'Total',       value: total,      color: '#6A7A8A' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                  >
                    <span className="font-display text-lg leading-none" style={{ color }}>
                      {value}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: `${color}AA` }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── active challenges ── */}
        <ActiveChallenges goals={goals} />

        {/* ── category filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const count = cat.id === 'all'
              ? goals.length
              : goals.filter(g => g.category === cat.id).length;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-2 rounded-full whitespace-nowrap transition-colors shrink-0"
                style={
                  active
                    ? { background: '#C9A84C', color: '#0A1628', fontWeight: 700 }
                    : { background: 'rgba(42,58,74,0.4)', color: 'rgba(245,240,220,0.5)' }
                }
              >
                {cat.emoji} {cat.label}
                <span
                  className="rounded-full px-1.5 py-0.5 font-mono text-[9px]"
                  style={{
                    background: active ? 'rgba(10,22,40,0.25)' : 'rgba(201,168,76,0.12)',
                    color: active ? '#0A1628' : 'rgba(201,168,76,0.6)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── achievement grid ── */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy size={40} className="text-cream/10 mx-auto mb-3" />
            <p className="font-serif text-cream/30">No achievements in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(g => (
              <AchievementCard key={g.id} goal={g} onLog={setLogTarget} />
            ))}
          </div>
        )}

        {/* ── quiz section ── */}
        {quizEntries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-gold/60" />
                <h2 className="font-display text-xl text-cream">Knowledge Tests</h2>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="font-serif text-sm text-cream/40 text-center">
              10 questions per president · Best score tracked
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quizEntries.map(q => (
                <QuizCard key={q.presidentId} entry={q} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
