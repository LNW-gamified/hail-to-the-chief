export type Rank = {
  level: number;
  title: string;
  minXp: number;
};

export const RANKS: Rank[] = [
  { level: 1, minXp: 0,    title: 'Apprentice Historian' },
  { level: 2, minXp: 100,  title: 'Junior Diplomat'      },
  { level: 3, minXp: 300,  title: 'Presidential Scholar' },
  { level: 4, minXp: 600,  title: 'Cabinet Secretary'    },
  { level: 5, minXp: 1000, title: 'Vice President'       },
  { level: 6, minXp: 1500, title: 'Commander in Chief'   },
];

export function getRank(xp: number) {
  const rank = [...RANKS].reverse().find(r => xp >= r.minXp) ?? RANKS[0];
  const nextRank = RANKS[rank.level] ?? null;
  const progress = nextRank
    ? Math.min(100, ((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;
  return { ...rank, nextRank, progress };
}
