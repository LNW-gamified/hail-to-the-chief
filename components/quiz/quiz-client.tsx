'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, ChevronRight, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { PortraitImg } from '@/components/ui/portrait-img';
import { submitQuiz } from '@/app/actions/submit-quiz';
import { ERA_COLORS, ordinal } from '@/lib/era';

// ── types ─────────────────────────────────────────────────────────────────────

export type QuizQuestion = {
  id: string;
  question: string;
  correctAnswer: string;
  shuffledOptions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
};

export type QuizPresident = {
  id: string;
  name: string;
  number: number;
  era: string | null;
  termStart: number;
  termEnd: number | null;
  portraitUrl: string | null;
};

type AnswerRecord = { isCorrect: boolean };

type QuizResult = {
  xpEarned: number;
  achievements: { name: string; icon: string; points: number }[];
};

type Props = {
  questions: QuizQuestion[];
  president: QuizPresident;
  locationId: string;
  bestPriorScore: number | null;
};

// ── results screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  score,
  total,
  xpEarned,
  achievements,
  eraColor,
  president,
  locationId,
  onRetry,
}: {
  score: number;
  total: number;
  xpEarned: number;
  achievements: { name: string; icon: string; points: number }[];
  eraColor: string;
  president: QuizPresident;
  locationId: string;
  onRetry: () => void;
}) {
  const isPerfect = score === total;
  const isGood = score >= 7;

  const grade = isPerfect
    ? 'Presidential Scholar 🏆'
    : isGood
    ? 'Well Briefed'
    : 'Return to the Archives';

  const badgeLabel = isPerfect ? 'GOLD EAGLE' : isGood ? 'SILVER BRIEF' : null;
  const badgeColor = isPerfect ? '#C9A84C' : '#9CA3AF';

  return (
    <div className="min-h-screen" style={{ background: '#0A1628' }}>
      {isPerfect && (
        <style>{`
          @keyframes goldGlow {
            0%, 100% { text-shadow: none; }
            50% { text-shadow: 0 0 30px rgba(201,168,76,0.9), 0 0 60px rgba(201,168,76,0.5), 0 0 90px rgba(201,168,76,0.2); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .score-perfect { animation: goldGlow 1.8s ease-in-out 3, scaleIn 0.5s ease-out both; }
        `}</style>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Portrait header */}
      <div className="relative" style={{ height: 160 }}>
        {president.portraitUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={president.portraitUrl}
              alt=""
              className="w-full h-full object-cover object-top"
              style={{ filter: 'blur(12px) brightness(0.2)', transform: 'scale(1.15)' }}
            />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: eraColor + '22' }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,22,40,0.3), #0A1628)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: eraColor }} />
      </div>

      <div className="px-4 pb-16 max-w-lg mx-auto" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
        {/* Score */}
        <div className="text-center pt-8 pb-6">
          <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-3">FINAL SCORE</p>
          <div
            className={`font-display leading-none mb-3 ${isPerfect ? 'score-perfect' : ''}`}
            style={{ fontSize: 88, color: isPerfect ? '#C9A84C' : '#F5F0E8' }}
          >
            {score}/{total}
          </div>
          <p className="font-serif text-lg text-cream/80">{grade}</p>
          <p className="font-mono text-xs text-cream/30 mt-1">
            {ordinal(president.number)} President · {president.name}
          </p>
        </div>

        {/* Badge */}
        {badgeLabel && (
          <div className="flex justify-center mb-5" style={{ animation: 'slideUp 0.4s ease-out 0.2s both' }}>
            <div
              className="flex items-center gap-2 font-mono text-sm font-bold px-5 py-2.5 rounded-full border"
              style={{
                color: badgeColor,
                borderColor: badgeColor + '55',
                background: badgeColor + '15',
              }}
            >
              <Trophy size={15} />
              {badgeLabel}
            </div>
          </div>
        )}

        {/* No XP note */}
        {!isGood && (
          <div
            className="rounded-2xl border border-border bg-card px-4 py-4 mb-4 text-center"
            style={{ animation: 'slideUp 0.4s ease-out 0.15s both' }}
          >
            <p className="font-serif text-sm text-cream/50">
              Score 7 or higher to earn XP. Study up and try again!
            </p>
          </div>
        )}

        {/* XP earned */}
        {xpEarned > 0 && (
          <div
            className="bg-card border border-border rounded-2xl p-4 mb-4 flex items-center justify-between"
            style={{ animation: 'slideUp 0.4s ease-out 0.2s both' }}
          >
            <div>
              <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-0.5">XP EARNED</p>
              <p className="font-display text-3xl text-gold">+{xpEarned}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              ⭐
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.map((ach, i) => (
          <div
            key={i}
            className="bg-card border border-gold/25 rounded-2xl p-4 mb-3 flex items-center gap-3"
            style={{ animation: `slideUp 0.4s ease-out ${0.3 + i * 0.1}s both` }}
          >
            <span className="text-2xl shrink-0">{ach.icon}</span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] text-gold/50 tracking-widest mb-0.5">ACHIEVEMENT UNLOCKED</p>
              <p className="font-serif text-sm text-cream">{ach.name}</p>
            </div>
            <span className="ml-auto font-mono text-sm text-gold shrink-0">+{ach.points} XP</span>
          </div>
        ))}

        {/* Actions */}
        <div className="space-y-3 mt-6" style={{ animation: 'slideUp 0.4s ease-out 0.4s both' }}>
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 font-mono text-sm font-bold py-3.5 rounded-xl border transition-colors hover:bg-gold/8"
            style={{ borderColor: 'rgba(201,168,76,0.3)', color: '#C9A84C' }}
          >
            <RotateCcw size={14} />
            Try Again
          </button>
          <Link
            href={`/libraries/${locationId}`}
            className="flex items-center justify-center gap-2 font-mono text-sm font-bold py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-[0.99]"
            style={{ background: '#C9A84C', color: '#0A1628' }}
          >
            Back to Library
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── quiz screen ───────────────────────────────────────────────────────────────

export default function QuizClient({ questions, president, locationId, bestPriorScore }: Props) {
  const router = useRouter();
  const eraColor = ERA_COLORS[president.era ?? ''] ?? '#C9A84C';
  const totalQ = questions.length;

  const [phase, setPhase] = useState<'quiz' | 'submitting' | 'results'>('quiz');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const q = questions[currentQ];
  const isAnswered = selectedAnswer !== null;
  const correctSoFar = answers.filter(a => a.isCorrect).length;

  const handleSelect = useCallback((option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  }, [isAnswered]);

  const handleNext = useCallback(async () => {
    if (!isAnswered || !q) return;

    const record: AnswerRecord = { isCorrect: selectedAnswer === q.correctAnswer };
    const newAnswers = [...answers, record];

    if (currentQ < totalQ - 1) {
      setAnswers(newAnswers);
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setPhase('submitting');
      const score = newAnswers.filter(a => a.isCorrect).length;
      let res: QuizResult = { xpEarned: 0, achievements: [] };
      try {
        const submitted = await submitQuiz(president.id, score, locationId);
        res = { xpEarned: submitted.xpEarned, achievements: submitted.earnedAchievements };
      } catch {
        // surface results without achievements on network error
      }
      setAnswers(newAnswers);
      setResult(res);
      setPhase('results');
    }
  }, [isAnswered, q, selectedAnswer, answers, currentQ, totalQ, president.id, locationId]);

  const handleRetry = useCallback(() => {
    setPhase('quiz');
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setResult(null);
    router.refresh();
  }, [router]);

  if (phase === 'results' && result) {
    return (
      <ResultsScreen
        score={answers.filter(a => a.isCorrect).length}
        total={totalQ}
        xpEarned={result.xpEarned}
        achievements={result.achievements}
        eraColor={eraColor}
        president={president}
        locationId={locationId}
        onRetry={handleRetry}
      />
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1628' }}>
        <div className="text-center">
          <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-4">TALLYING RESULTS</p>
          <div
            className="w-8 h-8 rounded-full border-2 border-t-gold mx-auto animate-spin"
            style={{ borderColor: 'rgba(201,168,76,0.2)', borderTopColor: '#C9A84C' }}
          />
        </div>
      </div>
    );
  }

  const progressPct = (currentQ / totalQ) * 100;
  const isCorrectAnswer = selectedAnswer === q.correctAnswer;

  return (
    <div className="min-h-screen" style={{ background: '#0A1628' }}>

      {/* ── header ── */}
      <div className="relative" style={{ height: 200 }}>
        {president.portraitUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={president.portraitUrl}
              alt=""
              className="w-full h-full object-cover object-top"
              style={{ filter: 'blur(10px) brightness(0.2)', transform: 'scale(1.12)' }}
            />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: eraColor + '22' }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,22,40,0.35) 0%, #0A1628 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: eraColor }} />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 font-mono text-xs text-cream/40 hover:text-cream/70 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {bestPriorScore !== null && (
          <div className="absolute top-4 right-4 z-20 font-mono text-[10px] text-cream/30">
            Best: {bestPriorScore}/10
          </div>
        )}

        {/* Portrait */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div
            className="w-[72px] h-[72px] rounded-full overflow-hidden"
            style={{ border: `3px solid ${eraColor}`, boxShadow: `0 0 20px ${eraColor}55` }}
          >
            <PortraitImg
              src={president.portraitUrl}
              alt={president.name}
              className="w-full h-full object-cover object-top"
              fallback={
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: eraColor + '33' }}
                >
                  <span className="font-mono text-xl font-bold" style={{ color: eraColor }}>
                    {president.name[0]}
                  </span>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* ── content ── */}
      <div className="px-4 pt-12 pb-12 max-w-lg mx-auto">

        {/* Title */}
        <div className="text-center mb-5">
          <p className="font-mono text-[10px] text-cream/30 tracking-widest mb-0.5">KNOWLEDGE TEST</p>
          <h1 className="font-display text-xl text-cream">{president.name}</h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-xs text-cream/40">
              Question {currentQ + 1} of {totalQ}
            </span>
            <span className="font-mono text-xs" style={{ color: eraColor }}>
              {correctSoFar} correct
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%`, backgroundColor: eraColor }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-5">
          <p className="font-serif text-[17px] leading-snug text-cream">{q.question}</p>
          {q.difficulty === 'hard' && (
            <span
              className="inline-block mt-2 font-mono text-[9px] tracking-widest rounded-full px-2.5 py-0.5"
              style={{
                color: 'rgba(245,240,232,0.25)',
                border: '1px solid rgba(245,240,232,0.1)',
              }}
            >
              HARD
            </span>
          )}
        </div>

        {/* Answer options */}
        <div className="space-y-2.5 mb-5">
          {q.shuffledOptions.map((option) => {
            const isCorrect = option === q.correctAnswer;
            const isSelected = option === selectedAnswer;

            let border = 'rgba(255,255,255,0.08)';
            let bg = 'rgba(255,255,255,0.025)';
            let textClass = 'text-cream';
            let icon: React.ReactNode = null;

            if (isAnswered) {
              if (isCorrect) {
                border = 'rgba(16,185,129,0.45)';
                bg = 'rgba(16,185,129,0.07)';
                textClass = 'text-emerald-300';
                icon = <Check size={15} className="text-emerald-400 shrink-0" />;
              } else if (isSelected) {
                border = 'rgba(239,68,68,0.45)';
                bg = 'rgba(239,68,68,0.07)';
                textClass = 'text-red-300';
                icon = <X size={15} className="text-red-400 shrink-0" />;
              } else {
                textClass = 'text-cream/20';
                bg = 'rgba(255,255,255,0.01)';
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                  !isAnswered
                    ? 'hover:bg-gold/5 active:scale-[0.99] cursor-pointer'
                    : 'cursor-default'
                }`}
                style={{
                  borderColor: !isAnswered ? 'rgba(255,255,255,0.08)' : border,
                  background: !isAnswered ? 'rgba(255,255,255,0.025)' : bg,
                  ...(isAnswered && isCorrect && {
                    boxShadow: '0 0 14px rgba(16,185,129,0.15)',
                  }),
                  ...(isAnswered && isSelected && !isCorrect && {
                    boxShadow: '0 0 14px rgba(239,68,68,0.12)',
                  }),
                }}
                onMouseEnter={e => {
                  if (isAnswered) return;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.3)';
                }}
                onMouseLeave={e => {
                  if (isAnswered) return;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {icon}
                <span className={`font-serif text-sm leading-snug ${isAnswered ? textClass : 'text-cream'}`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback + Next */}
        {isAnswered && (
          <div className="space-y-3">
            <div
              className="rounded-xl px-4 py-3 border"
              style={
                isCorrectAnswer
                  ? { background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }
                  : { background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.18)' }
              }
            >
              <p className="font-serif text-sm text-cream/65 leading-relaxed">
                {isCorrectAnswer
                  ? `Correct! ${q.correctAnswer}.`
                  : `The correct answer is: ${q.correctAnswer}.`}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 font-mono text-sm font-bold py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: '#C9A84C', color: '#0A1628' }}
            >
              {currentQ < totalQ - 1 ? (
                <>Next Question <ChevronRight size={16} /></>
              ) : (
                <>See Results <Trophy size={16} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
