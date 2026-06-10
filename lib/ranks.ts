export type Rank = {
  level: number;
  title: string;
  minXp: number;
};

export const RANKS: Rank[] = [
  { level: 1, minXp: 0,    title: 'Page'               },
  { level: 2, minXp: 100,  title: 'Attaché'            },
  { level: 3, minXp: 250,  title: 'Chief of Staff'     },
  { level: 4, minXp: 500,  title: 'Senator'            },
  { level: 5, minXp: 1000, title: 'Secretary of State' },
  { level: 6, minXp: 2000, title: 'Vice President'     },
  { level: 7, minXp: 3500, title: 'President-Elect'    },
  { level: 8, minXp: 5000, title: 'Commander in Chief' },
];

export function getRank(xp: number) {
  const rank = [...RANKS].reverse().find(r => xp >= r.minXp) ?? RANKS[0];
  const nextRank = RANKS[rank.level] ?? null;
  const progress = nextRank
    ? Math.min(100, ((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;
  return { ...rank, nextRank, progress };
}

export function getRankByTitle(title: string): Rank | null {
  return RANKS.find(r => r.title === title) ?? null;
}
