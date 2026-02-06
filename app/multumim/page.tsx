'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MultumimContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get('order');

  const telegramUrl = order 
    ? `https://t.me/REPLACE_ME_BOT?start=${order}`
    : 'https://t.me/REPLACE_ME_BOT';

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "linear-gradient(to bottom, #f5ede3, #ebdfce)" }}>
      <section className="py-20 md:py-32">
        <div className="mx-auto px-4 sm:px-6 max-w-2xl w-full">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 text-center uppercase"
            style={{ 
              color: "#1F2933",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            MULȚUMIM!
          </h1>

          <div 
            className="rounded-2xl p-8 md:p-12 space-y-8"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Order Code */}
            <div className="text-center space-y-4">
              <p className="text-lg" style={{ color: "#6B7280" }}>
                Codul comenzii:
              </p>
              <div 
                className="inline-block px-6 py-3 rounded-lg font-mono text-lg font-semibold"
                style={{ 
                  backgroundColor: "#faf8f5",
                  color: "#1F2933",
                  border: "1px solid #e5d9c8",
                }}
              >
                {order || '—'}
              </div>
            </div>

            {/* Telegram Button */}
            <div className="pt-8">
              <Link
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-lg text-lg font-semibold uppercase tracking-wide text-center transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(229, 107, 111, 0.4)",
                }}
              >
                Primește acces în Telegram
              </Link>
            </div>

            {/* Info Note */}
            <div className="pt-4 text-center">
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Accesul la curs va fi activat în contul tău imediat după confirmarea plății.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MultumimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #f5ede3, #ebdfce)" }}>
        <p style={{ color: "#6B7280" }}>Se încarcă...</p>
      </div>
    }>
      <MultumimContent />
    </Suspense>
  );
}

