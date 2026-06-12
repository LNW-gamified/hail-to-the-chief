'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getRank } from '@/lib/ranks';

import type { EarnedAchievement } from '@/lib/achievements';
export type { EarnedAchievement };

export type SubmitQuizResult = {
  xpEarned: number;
  earnedAchievements: EarnedAchievement[];
  rankUpTo: string | null;
  error?: string;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export async function submitQuiz(
  presidentId: string,
  score: number,
  locationId: string,
): Promise<SubmitQuizResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { xpEarned: 0, earnedAchievements: [], rankUpTo: null, error: 'Not authenticated' };

  await supabase.from('trivia_scores').insert({
    user_id: user.id,
    president_id: presidentId,
    score,
    completed_at: new Date().toISOString(),
  });

  const baseXP = score === 10 ? 50 : score >= 7 ? 25 : 0;

  const [
    { data: allScores },
    { data: quizAchievements },
    { data: alreadyEarned },
    { data: naraLocs },
  ] = await Promise.all([
    supabase
      .from('trivia_scores')
      .select('president_id, score')
      .eq('user_id', user.id),
    supabase
      .from('achievements')
      .select('id, name, icon, points, trigger_condition')
      .eq('tracking_type', 'quiz'),
    supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id),
    supabase
      .from('presidential_locations')
      .select('presidents(id)')
      .eq('tier', 1)
      .eq('is_active', true),
  ]);

  const earnedIds = new Set((alreadyEarned ?? []).map(e => e.achievement_id));
  const scores = allScores ?? [];
  const uniquePresidentIds = new Set(scores.map(s => s.president_id));
  const hasPerfect = scores.some(s => s.score === 10);

  const naraPresidentIds = new Set(
    (naraLocs ?? [])
      .map(loc => (one(loc.presidents as never) as { id: string } | null)?.id)
      .filter(Boolean) as string[],
  );

  const newEarned: EarnedAchievement[] = [];
  let achXP = 0;

  for (const ach of quizAchievements ?? []) {
    if (earnedIds.has(ach.id)) continue;
    const cond = (ach.trigger_condition ?? {}) as Record<string, unknown>;
    let award = false;

    switch (cond.type) {
      case 'quiz_complete':
        award = uniquePresidentIds.size >= (cond.min_count as number);
        break;
      case 'quiz_perfect_score':
        award = hasPerfect;
        break;
      case 'quiz_complete_nara': {
        const naraCompleted = [...uniquePresidentIds].filter(id => naraPresidentIds.has(id)).length;
        award = naraCompleted >= (cond.min_count as number);
        break;
      }
    }

    if (award) {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: ach.id,
        manually_claimed: false,
      });
      if (!error) {
        newEarned.push({ name: ach.name, icon: ach.icon ?? '🏆', points: ach.points });
        achXP += ach.points;
      }
    }
  }

  const totalXP = baseXP + achXP;

  const { data: prof } = await supabase
    .from('user_profiles')
    .select('total_xp')
    .eq('id', user.id)
    .maybeSingle();

  const oldXP = prof?.total_xp ?? 0;
  const newXP = oldXP + totalXP;

  if (totalXP > 0) {
    await supabase
      .from('user_profiles')
      .upsert({ id: user.id, total_xp: newXP }, { onConflict: 'id' });
  }

  const oldRank = getRank(oldXP);
  const newRankData = getRank(newXP);
  const rankUpTo = newRankData.level > oldRank.level ? newRankData.title : null;

  revalidatePath(`/libraries/${locationId}`);
  revalidatePath('/goals');
  revalidatePath('/home');

  return { xpEarned: totalXP, earnedAchievements: newEarned, rankUpTo };
}
