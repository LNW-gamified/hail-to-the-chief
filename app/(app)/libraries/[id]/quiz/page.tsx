import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import QuizClient, { type QuizQuestion, type QuizPresident } from '@/components/quiz/quiz-client';

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rawLocation } = await supabase
    .from('presidential_locations')
    .select(`
      id,
      presidents (
        id, number, name, era, term_start, term_end, portrait_url
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!rawLocation) notFound();

  const rawP = one(rawLocation.presidents as never) as {
    id: string; number: number; name: string;
    era: string | null; term_start: number; term_end: number | null;
    portrait_url: string | null;
  } | null;

  if (!rawP) notFound();

  const [{ data: rawQ }, { data: bestScore }] = await Promise.all([
    supabase
      .from('trivia_questions')
      .select('id, question, correct_answer, wrong_answers, difficulty')
      .eq('president_id', rawP.id),
    supabase
      .from('trivia_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('president_id', rawP.id)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!rawQ || rawQ.length === 0) notFound();

  const questions: QuizQuestion[] = shuffle(rawQ).slice(0, 10).map(q => ({
    id: q.id,
    question: q.question,
    correctAnswer: q.correct_answer,
    shuffledOptions: shuffle([q.correct_answer, ...(q.wrong_answers as string[])]),
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
  }));

  const president: QuizPresident = {
    id: rawP.id,
    name: rawP.name,
    number: rawP.number,
    era: rawP.era,
    termStart: rawP.term_start,
    termEnd: rawP.term_end,
    portraitUrl: rawP.portrait_url,
  };

  return (
    <QuizClient
      questions={questions}
      president={president}
      locationId={id}
      bestPriorScore={bestScore?.score ?? null}
    />
  );
}
