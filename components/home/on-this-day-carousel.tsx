'use client';

import { useState, useEffect } from 'react';

export type OnThisDayEntry = {
  fact: string;
  year: number | null;
  category: string;
  presidentName: string | null;
  presidentNumber: number | null;
  portraitUrl: string | null;
};

const CATEGORY_EMOJI: Record<string, string> = {
  inauguration: '🏛️',
  legislation: '📜',
  war: '⚔️',
  achievement: '🌟',
  death: '✝️',
  birth: '👶',
  scandal: '📰',
};

const CATEGORY_LABEL: Record<string, string> = {
  inauguration: 'INAUGURATION',
  legislation: 'LEGISLATION',
  war: 'WAR',
  achievement: 'ACHIEVEMENT',
  death: 'DEATH',
  birth: 'BIRTH',
  scandal: 'SCANDAL',
};

export default function OnThisDayCarousel({ entries }: { entries: OnThisDayEntry[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (entries.length <= 1) return;
    const id = setInterval(() => setIndex(i => (i + 1) % entries.length), 6000);
    return () => clearInterval(id);
  }, [entries.length]);

  if (!entries.length) {
    return (
      <p className="font-serif text-cream/30 italic">
        No intelligence on record for today. Check back tomorrow.
      </p>
    );
  }

  const entry = entries[index];
  const emoji = CATEGORY_EMOJI[entry.category] ?? '📋';
  const label = CATEGORY_LABEL[entry.category] ?? entry.category.toUpperCase();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span>{emoji}</span>
        <span className="font-mono text-[9px] text-gold/50 tracking-[0.2em]">{label}</span>
      </div>

      <p className="font-serif text-base text-cream/85 leading-relaxed">
        {entry.fact}
      </p>

      <div className="flex items-center gap-3">
        {entry.portraitUrl ? (
          <img
            src={entry.portraitUrl}
            alt={entry.presidentName ?? ''}
            className="w-8 h-8 rounded-full object-cover object-top border border-gold/30 shrink-0"
          />
        ) : entry.presidentName ? (
          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            <span className="font-mono text-[10px] text-gold">
              {entry.presidentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        ) : null}

        <div>
          {entry.year && (
            <p className="font-mono text-xs text-gold/60">— {entry.year}</p>
          )}
          {entry.presidentName && (
            <p className="font-mono text-[10px] text-cream/35">Pres. {entry.presidentName}</p>
          )}
        </div>
      </div>

      {entries.length > 1 && (
        <div className="flex items-center gap-1.5 pt-1">
          {entries.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-3 bg-gold' : 'w-1.5 bg-cream/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
