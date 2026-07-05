'use client';

import { useState } from 'react';
import Link from 'next/link';

const PRODUCT_ID = 'psihologia_banilor';

type Props = {
  /** Visible label, e.g. "Vreau bilet — 000 lei". Price is display-only; the
   *  charged amount comes from the server product registry (lib/products.ts). */
  label: string;
};

export default function TicketButton({ label }: Props) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!acceptedTerms || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/paynet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // amount/currency are resolved server-side from the product registry.
        body: JSON.stringify({ productId: PRODUCT_ID }),
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
        // Paynet getecom expects a POST form submit, not a GET redirect.
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

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Terms */}
      <label
        className="flex items-start gap-3 text-left text-sm leading-relaxed cursor-pointer"
        style={{ color: '#4B5563' }}
      >
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-2 cursor-pointer flex-shrink-0"
          style={{ accentColor: '#E56B6F' }}
        />
        <span>
          Am citit și accept{' '}
          <Link
            href="/termeni"
            target="_blank"
            className="underline font-semibold"
            style={{ color: '#E56B6F' }}
          >
            Termenii și Condițiile
          </Link>{' '}
          și{' '}
          <Link
            href="/confidentialitate"
            target="_blank"
            className="underline font-semibold"
            style={{ color: '#E56B6F' }}
          >
            Politica de Confidențialitate
          </Link>
        </span>
      </label>

      {error && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={!acceptedTerms || isLoading}
        className="w-full py-4 rounded-lg text-lg font-semibold uppercase tracking-wide transition-all"
        style={{
          background:
            acceptedTerms && !isLoading
              ? 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)'
              : '#d1d5db',
          color: acceptedTerms && !isLoading ? '#FFFFFF' : '#9ca3af',
          boxShadow:
            acceptedTerms && !isLoading ? '0 4px 12px rgba(229, 107, 111, 0.4)' : 'none',
          cursor: acceptedTerms && !isLoading ? 'pointer' : 'not-allowed',
          opacity: acceptedTerms && !isLoading ? 1 : 0.6,
        }}
      >
        {isLoading ? 'Se procesează...' : acceptedTerms ? label : 'Bifează termenii pentru a continua'}
      </button>

      <p className="text-xs text-center" style={{ color: '#6B7280' }}>
        🔒 Plată securizată prin Paynet. După plată primești confirmarea pe Telegram.
      </p>
    </div>
  );
}
