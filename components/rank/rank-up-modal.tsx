'use client';

import { useEffect, useState } from 'react';
import { getRankByTitle } from '@/lib/ranks';
import RankBadge from './rank-badge';

// Deterministic confetti config (no Math.random() — avoids hydration mismatch)
const CONFETTI = Array.from({ length: 42 }, (_, i) => ({
  color: ['#B22234', '#F5F0E8', '#1E3A8B', '#C9A84C', '#FFFFFF', '#3A6AB0'][i % 6],
  left:  Number(((i * 7.31 + 2.5) % 100).toFixed(1)),
  delay: Number(((i * 0.058) % 1.4).toFixed(3)),
  dur:   Number((1.3 + (i % 7) * 0.11).toFixed(2)),
  wide:  i % 4 !== 0,
  size:  6 + (i % 4) * 2,
  rot:   (i * 43) % 360,
}));

type Props = {
  rankTitle: string;
  onClose: () => void;
};

export default function RankUpModal({ rankTitle, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const rank = getRankByTitle(rankTitle);

  // Trigger entrance animation on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(4,10,20,0.92)',
        backdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-24px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes badge-spin-in {
          0%   { transform: rotate(-540deg) scale(0.2); opacity: 0; }
          65%  { transform: rotate(12deg) scale(1.06);  opacity: 1; }
          80%  { transform: rotate(-4deg) scale(0.97); }
          100% { transform: rotate(0deg) scale(1);      opacity: 1; }
        }
        @keyframes rank-text-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            top: 0,
            left: `${c.left}%`,
            width:  c.wide ? c.size * 1.6 : c.size,
            height: c.wide ? c.size * 0.5  : c.size,
            background: c.color,
            borderRadius: c.wide ? '2px' : '50%',
            animation: `confetti-fall ${c.dur}s ease-in ${c.delay}s both`,
            transform: `rotate(${c.rot}deg)`,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      ))}

      {/* Card */}
      <div
        className="relative z-[9999] flex flex-col items-center text-center px-10 py-12 max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0D1E35 0%, #0A1628 60%, #040E1C 100%)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 24,
          boxShadow: '0 0 60px rgba(201,168,76,0.15), 0 24px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Badge spinning in */}
        <div
          style={{
            animation: visible ? 'badge-spin-in 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' : 'none',
            filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.55)) drop-shadow(0 0 40px rgba(201,168,76,0.25))',
          }}
        >
          <RankBadge level={rank?.level ?? 1} size={140} />
        </div>

        {/* Promotion text */}
        <div
          style={{
            animation: visible ? 'rank-text-up 0.5s ease-out 0.75s both' : 'none',
          }}
        >
          <p className="font-mono text-[10px] tracking-[0.35em] text-gold/50 mt-6 mb-1">
            RANK ACHIEVED
          </p>
          <p className="font-serif text-sm text-cream/60 mb-1">
            You&apos;ve been promoted to
          </p>
          <h2
            className="font-display text-4xl leading-tight"
            style={{ color: '#F0D060', textShadow: '0 0 20px rgba(201,168,76,0.4)' }}
          >
            {rankTitle}
          </h2>
        </div>

        {/* XP range hint */}
        <p
          className="font-mono text-[10px] text-cream/25 mt-3"
          style={{ animation: visible ? 'rank-text-up 0.5s ease-out 0.9s both' : 'none' }}
        >
          {rank ? `Level ${rank.level} · ${rank.minXp.toLocaleString()}+ XP` : ''}
        </p>

        {/* Continue button */}
        <button
          onClick={handleClose}
          className="mt-8 font-mono text-sm font-bold px-8 py-3 rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: '#C9A84C',
            color: '#0A1628',
            animation: visible ? 'rank-text-up 0.5s ease-out 1.05s both' : 'none',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
