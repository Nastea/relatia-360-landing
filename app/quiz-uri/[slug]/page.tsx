import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuizRunner from './QuizRunner';
import { getQuizBySlug } from '@/lib/quizzes';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) {
    return { title: 'Quiz | Relația 360' };
  }
  return {
    title: `${quiz.title} | Relația 360`,
    description: quiz.description,
  };
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) notFound();

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #f5ede3, #ebdfce)' }}
    >
      <section className="py-14 md:py-20">
        <div className="mx-auto px-4 sm:px-6 max-w-3xl w-full">
          <div className="mb-7 md:mb-9">
            <Link
              href="/quiz-uri"
              className="text-sm md:text-base underline underline-offset-4 hover:opacity-80"
              style={{ color: '#6B7280' }}
            >
              ← Toate quiz-urile
            </Link>
          </div>

          <header className="mb-6 md:mb-8">
            <h1
              className="text-3xl md:text-5xl font-bold uppercase mb-3"
              style={{ color: '#1F2933', letterSpacing: '-0.02em', lineHeight: '1.1' }}
            >
              {quiz.title}
            </h1>
            <p className="text-base md:text-lg" style={{ color: '#6B7280' }}>
              {quiz.subtitle}
            </p>
          </header>

          <QuizRunner quiz={quiz} />
        </div>
      </section>
    </div>
  );
}
