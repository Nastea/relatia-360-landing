'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlataPage() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handlePayment = () => {
    if (acceptedTerms) {
      // Placeholder URL - va fi înlocuit cu URL-ul real de plată
      window.location.href = 'https://paynet.md/placeholder';
    }
  };

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
            FINALIZARE<br />
            PLATĂ
          </h1>

          <div 
            className="rounded-2xl p-8 md:p-12 space-y-8"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Course Info */}
            <div className="text-center pb-8 border-b" style={{ borderColor: "#e5d9c8" }}>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                RELAȚIA 360<br />
                DE LA CONFLICT LA CONECTARE
              </h2>
              <p className="text-lg" style={{ color: "#6B7280" }}>
                Curs practic de comunicare în relații
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: "#faf8f5" }}>
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-2 cursor-pointer"
                  style={{
                    accentColor: "#E56B6F",
                    borderColor: acceptedTerms ? "#E56B6F" : "#d1d5db",
                  }}
                />
                <label 
                  htmlFor="terms-checkbox"
                  className="flex-1 text-base leading-relaxed cursor-pointer"
                  style={{ color: "#1F2933" }}
                >
                  Am citit și accept{' '}
                  <Link 
                    href="/termeni"
                    className="underline hover:opacity-80 transition-opacity font-semibold"
                    style={{ color: "#E56B6F" }}
                    target="_blank"
                  >
                    Termenii și Condițiile
                  </Link>
                  {' '}și{' '}
                  <Link 
                    href="/confidentialitate"
                    className="underline hover:opacity-80 transition-opacity font-semibold"
                    style={{ color: "#E56B6F" }}
                    target="_blank"
                  >
                    Politica de Confidențialitate
                  </Link>
                </label>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!acceptedTerms}
                className="w-full py-4 rounded-lg text-lg font-semibold uppercase tracking-wide transition-all"
                style={{
                  background: acceptedTerms 
                    ? "linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)"
                    : "#d1d5db",
                  color: acceptedTerms ? "#FFFFFF" : "#9ca3af",
                  boxShadow: acceptedTerms 
                    ? "0 4px 12px rgba(229, 107, 111, 0.4)"
                    : "none",
                  cursor: acceptedTerms ? "pointer" : "not-allowed",
                  opacity: acceptedTerms ? 1 : 0.6,
                }}
              >
                {acceptedTerms ? "Plătește" : "Bifează termenii pentru a continua"}
              </button>

              {/* Info Note */}
              <div className="pt-4 text-center">
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  Vei fi redirecționat către platforma de plată securizată Paynet
                </p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: "#6B7280" }}>
              🔒 Plăți securizate prin Paynet
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

