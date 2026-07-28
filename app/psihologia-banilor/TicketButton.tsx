'use client';

import { useState } from 'react';
import Link from 'next/link';

const PRODUCT_ID = 'psihologia_banilor';

type Props = {
  /** Visible label, e.g. "Vreau bilet — 990 lei". Price is display-only; the
   *  charged amount comes from the server product registry (lib/products.ts). */
  label: string;
};

const INK = '#1F2933';
const GOLD = '#B8975A';

export default function TicketButton({ label }: Props) {
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

    try {
      const res = await fetch('/api/paynet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: PRODUCT_ID,
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
        setError(
          json.details ||
            json.error ||
            'Nu s-a putut genera link-ul de plată. Te rugăm să încerci din nou.',
        );
        setIsLoading(false);
        return;
      }

      if (json.ok && json.paynet_redirect_action && json.paynet_redirect_params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = json.paynet_redirect_action;
        Object.entries(json.paynet_redirect_params as Record<string, string>).forEach(
          ([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          },
        );
        document.body.appendChild(form);
        form.submit();
        return;
      }

      setError(
        json.details ||
          json.error ||
          'Nu s-a putut genera link-ul de plată. Te rugăm să încerci din nou.',
      );
      setIsLoading(false);
    } catch (e) {
      console.error('TICKET_PAYMENT_ERROR', e);
      setError('A apărut o eroare de rețea. Te rugăm să încerci din nou.');
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(184,151,90,0.35)',
    color: INK,
  };
  const inputClass =
    'w-full px-4 py-3 rounded-lg text-base outline-none focus:border-[color:var(--gold)] transition-colors';

  return (
    <div className="w-full max-w-md mx-auto space-y-4 text-left" style={{ ['--gold' as string]: GOLD }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Prenume"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputClass}
          style={inputStyle}
          autoComplete="given-name"
        />
        <input
          type="text"
          placeholder="Nume"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputClass}
          style={inputStyle}
          autoComplete="family-name"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
        style={inputStyle}
        autoComplete="email"
      />
      <input
        type="tel"
        placeholder="Telefon (ex: 069123456)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
        style={inputStyle}
        autoComplete="tel"
      />

      <label
        className="flex items-start gap-3 text-sm leading-relaxed cursor-pointer pt-1"
        style={{ color: '#4B5563' }}
      >
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 w-5 h-5 rounded cursor-pointer flex-shrink-0"
          style={{ accentColor: GOLD }}
        />
        <span>
          Am citit și accept{' '}
          <Link href="/termeni" target="_blank" className="underline font-semibold" style={{ color: GOLD }}>
            Termenii și Condițiile
          </Link>{' '}
          și{' '}
          <Link href="/confidentialitate" target="_blank" className="underline font-semibold" style={{ color: GOLD }}>
            Politica de Confidențialitate
          </Link>
        </span>
      </label>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={!formOk || isLoading}
        className="w-full py-4 rounded-full text-lg font-semibold uppercase tracking-wide transition-all"
        style={{
          background: formOk && !isLoading ? 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)' : '#d1d5db',
          color: formOk && !isLoading ? '#FFFFFF' : '#9ca3af',
          boxShadow: formOk && !isLoading ? '0 8px 20px rgba(229, 107, 111, 0.35)' : 'none',
          cursor: formOk && !isLoading ? 'pointer' : 'not-allowed',
          letterSpacing: '0.05em',
        }}
      >
        {isLoading ? 'Se procesează...' : formOk ? label : 'Completează datele pentru a continua'}
      </button>

      <p className="text-xs text-center" style={{ color: '#6B7280' }}>
        🔒 Plată securizată prin Paynet. După plată primești confirmarea pe Telegram.
      </p>
    </div>
  );
}
