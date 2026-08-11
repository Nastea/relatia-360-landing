'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlataPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, '').replace(/^373/, '').length >= 8;
  const formOk =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    emailOk &&
    phoneOk &&
    acceptedTerms;

  const handlePayment = async () => {
    if (!formOk || isLoading) return;

    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/paynet/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'relatia360_conflicte',
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      }),
    });

    const json = await res.json();
    console.log('PAYNET_CREATE_RESPONSE', json);

    if (json.error) {
      // Display error from API
      const errorMsg = json.details || json.error || 'Nu s-a putut genera link-ul de plată. Te rugăm să încerci din nou.';
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    if (json.ok && json.paynet_redirect_action && json.paynet_redirect_params) {
      // Paynet getecom expects POST (form submit), not GET
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = json.paynet_redirect_action;
      Object.entries(json.paynet_redirect_params as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } else if (json.ok && json.payment_url) {
      window.location.assign(json.payment_url);
    } else if (json.ok && json.payment_id && json.redirect_base) {
      window.location.assign(`${json.redirect_base}?operation=${json.payment_id}&Lang=ro`);
    } else {
      // No payment URL in response
      setError(json.details || json.error || 'Nu s-a putut genera link-ul de plată. Te rugăm să încerci din nou.');
      setIsLoading(false);
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
              <div
                className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full"
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecdd3",
                }}
              >
                <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#9f1239" }}>
                  Preț: 49 EUR
                </span>
              </div>
            </div>

            {/* Customer details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Prenume"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-base outline-none"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)", color: "#1F2933" }}
                    autoComplete="given-name"
                  />
                  <input
                    type="text"
                    placeholder="Nume"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-base outline-none"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)", color: "#1F2933" }}
                    autoComplete="family-name"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)", color: "#1F2933" }}
                  autoComplete="email"
                />
                <input
                  type="tel"
                  placeholder="Telefon (ex: 069123456)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-base outline-none"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)", color: "#1F2933" }}
                  autoComplete="tel"
                />
              </div>

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

              {/* Error Message */}
              {error && (
                <div 
                  className="p-4 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!formOk || isLoading}
                className="w-full py-4 rounded-lg text-lg font-semibold uppercase tracking-wide transition-all"
                style={{
                  background: formOk && !isLoading
                    ? "linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)"
                    : "#d1d5db",
                  color: formOk && !isLoading ? "#FFFFFF" : "#9ca3af",
                  boxShadow: formOk && !isLoading
                    ? "0 4px 12px rgba(229, 107, 111, 0.4)"
                    : "none",
                  cursor: formOk && !isLoading ? "pointer" : "not-allowed",
                  opacity: formOk && !isLoading ? 1 : 0.6,
                }}
              >
                {isLoading
                  ? "Se procesează..."
                  : formOk
                    ? "Plătește 49 EUR"
                    : "Completează datele pentru a continua"}
              </button>

              <div className="text-center">
                <Link
                  href="/conflicte"
                  className="inline-block px-6 py-3 rounded-lg text-sm md:text-base font-semibold uppercase tracking-wide transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#E56B6F",
                    border: "1px solid #E56B6F",
                  }}
                >
                  Vreau acces la lecția gratuită
                </Link>
              </div>

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

