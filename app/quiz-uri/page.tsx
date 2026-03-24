import Link from 'next/link';
import type { Metadata } from 'next';
import { QUIZZES } from '@/lib/quizzes';

export const metadata: Metadata = {
  title: 'Quiz-uri de relație | Relația 360',
  description:
    'Alege quiz-ul care îți arată ce se întâmplă, de fapt, în relația voastră.',
};

export default function QuizHubPage() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #f5ede3, #ebdfce)' }}
    >
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-5xl w-full">
          <div className="text-center mb-10 md:mb-14">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 uppercase"
              style={{ color: '#1F2933', letterSpacing: '-0.02em', lineHeight: '1.1' }}
            >
              Quiz-uri de relație
            </h1>
            <p className="text-lg md:text-xl" style={{ color: '#6B7280' }}>
              Alege quiz-ul care îți arată ce se întâmplă, de fapt, în relația voastră.
            </p>
          </div>

          <div className="grid gap-5 md:gap-6">
            {QUIZZES.map((quiz) => (
              <article
                key={quiz.slug}
                className="rounded-2xl p-6 md:p-8"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1F2933' }}>
                  {quiz.title}
                </h2>
                <p className="text-base md:text-lg mb-6" style={{ color: '#6B7280' }}>
                  {quiz.description}
                </p>
                <Link
                  href={`/quiz-uri/${quiz.slug}`}
                  className="inline-block px-6 py-3 rounded-lg text-sm md:text-base font-semibold uppercase tracking-wide transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(229, 107, 111, 0.35)',
                  }}
                >
                  Începe quiz-ul
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
