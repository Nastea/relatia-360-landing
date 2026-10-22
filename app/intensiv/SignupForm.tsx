'use client';

import { useState } from 'react';
import Link from 'next/link';
import { startCheckout } from '@/lib/startCheckout';

export default function SignupForm({ productId, label }: { productId: string; label: string }) {
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
    firstName.trim() !== '' && lastName.trim() !== '' && emailOk && phoneOk && acceptedTerms;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOk || isLoading) return;
    setIsLoading(true);
    setError(null);
    const err = await startCheckout(productId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    if (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  return (
    <form className="ix-form" onSubmit={submit} noValidate>
      <div className="ix-form-row">
        <label>
          <span>Prenume</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
        </label>
        <label>
          <span>Nume</span>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required />
        </label>
      </div>
      <label>
        <span>Email (aici primești linkurile)</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        <span>Telefon</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="069123456" required />
      </label>
      <label className="ix-check">
        <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
        <span>
          Am citit și accept <Link href="/termeni" target="_blank">Termenii și Condițiile</Link> și{' '}
          <Link href="/confidentialitate" target="_blank">Politica de Confidențialitate</Link>.
        </span>
      </label>
      {error && <p className="ix-form-error" role="alert">{error}</p>}
      <button type="submit" className="ix-btn ix-btn-wide" disabled={!formOk || isLoading}>
        {isLoading ? 'Se procesează…' : formOk ? label : 'Completează datele ca să continui'}
      </button>
      <p className="ix-form-note">
        Plată securizată cu cardul, prin Paynet. După plată primești pe email linkul spre grupul
        participanților, unde vin caietul și linkul de Zoom.
      </p>
    </form>
  );
}
