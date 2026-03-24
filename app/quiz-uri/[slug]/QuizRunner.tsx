'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { QuizDefinition } from '@/lib/quizzes';
import { getResultFromAnswers } from '@/lib/quizzes';

type Props = {
  quiz: QuizDefinition;
};

export default function QuizRunner({ quiz }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [botUsername, setBotUsername] = useState('Relatia360Bot');

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.telegramBotUsername) setBotUsername(data.telegramBotUsername);
      })
      .catch(() => {});
  }, []);

  const total = quiz.questions.length;
  const progress = Math.round(((currentStep + 1) / total) * 100);
  const isDone = currentStep >= total;

  const resultKey = useMemo(() => {
    if (answers.length !== total) return null;
    return getResultFromAnswers(answers);
  }, [answers, total]);

  const telegramUrl = useMemo(() => {
    if (!resultKey) return `https://t.me/${botUsername}`;
    const safeSlug = quiz.slug.replace(/-/g, '_');
    const payload = `quiz_${safeSlug}_${resultKey}`;
    return `https://t.me/${botUsername}?start=${payload}`;
  }, [botUsername, quiz.slug, resultKey]);

  const handleNext = () => {
    if (selected == null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    setCurrentStep((s) => s + 1);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelected(null);
    setAnswers([]);
  };

  if (isDone) {
    return (
      <div
        className="rounded-2xl p-6 md:p-8 text-center space-y-6"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#1F2933' }}>
            Rezultatul tău este gata
          </h2>
          <p className="text-base md:text-lg" style={{ color: '#6B7280' }}>
            Primește-l acum pe Telegram
          </p>
        </div>

        <Link
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-lg text-base md:text-lg font-semibold uppercase tracking-wide transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(229, 107, 111, 0.35)',
          }}
        >
          Primește rezultatul pe Telegram
        </Link>

        <button
          type="button"
          onClick={handleRestart}
          className="inline-block text-sm md:text-base underline underline-offset-4 hover:opacity-80"
          style={{ color: '#6B7280' }}
        >
          Refă quiz-ul
        </button>
      </div>
    );
  }

  const q = quiz.questions[currentStep];

  return (
    <div
      className="rounded-2xl p-5 md:p-8"
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2" style={{ color: '#6B7280' }}>
          <span>Întrebarea {currentStep + 1} din {total}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#f3e8e9' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)',
            }}
          />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-5 leading-snug" style={{ color: '#1F2933' }}>
        {q.prompt}
      </h2>

      <div className="space-y-3">
        {q.options.map((option, idx) => {
          const active = selected === idx;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(idx)}
              className="w-full text-left rounded-xl px-4 py-4 transition-all duration-200"
              style={{
                border: active ? '2px solid #E56B6F' : '1px solid #e5d9c8',
                backgroundColor: active ? '#fff1f2' : '#FFFFFF',
                color: '#1F2933',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Link
          href="/quiz-uri"
          className="text-sm md:text-base underline underline-offset-4 hover:opacity-80"
          style={{ color: '#6B7280' }}
        >
          Înapoi la quiz-uri
        </Link>
        <button
          type="button"
          onClick={handleNext}
          disabled={selected == null}
          className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
          style={{
            background:
              selected != null
                ? 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)'
                : '#d1d5db',
            color: selected != null ? '#FFFFFF' : '#9ca3af',
            cursor: selected != null ? 'pointer' : 'not-allowed',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
