'use client';

import { useState } from 'react';

const PRODUCT = 'psihologia_banilor';
const INK = '#1F2933';
const GOLD = '#B8975A';

export default function BroadcastAdminPage() {
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(184,151,90,0.4)',
    color: INK,
  };
  const inputClass = 'w-full px-4 py-3 rounded-lg text-base outline-none';

  const checkRecipients = async () => {
    setError(null);
    setStatus(null);
    setCount(null);
    if (!key.trim()) {
      setError('Introdu parola.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/telegram/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim(), product: PRODUCT, dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Eroare la verificare.');
      } else {
        setCount(data.total);
      }
    } catch {
      setError('Eroare de rețea.');
    }
    setBusy(false);
  };

  const send = async () => {
    setError(null);
    setStatus(null);
    if (!key.trim()) return setError('Introdu parola.');
    if (!message.trim()) return setError('Scrie un mesaj.');
    if ((buttonText.trim() && !buttonUrl.trim()) || (!buttonText.trim() && buttonUrl.trim())) {
      return setError('Pentru buton, completează și textul, și link-ul (sau lasă ambele goale).');
    }
    if (!confirm('Sigur trimiți mesajul tuturor înscrișilor?')) return;

    setBusy(true);
    let offset = 0;
    let sent = 0;
    let failed = 0;
    try {
      // Buclă pe loturi până done.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        setStatus(`Se trimite… ${sent} trimise${failed ? `, ${failed} eșuate` : ''}`);
        const res = await fetch('/api/telegram/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: key.trim(),
            product: PRODUCT,
            message: message.trim(),
            buttonText: buttonText.trim() || undefined,
            buttonUrl: buttonUrl.trim() || undefined,
            offset,
            limit: 40,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Eroare la trimitere.');
          break;
        }
        sent += data.sent || 0;
        failed += data.failed || 0;
        offset = data.nextOffset;
        if (data.done) {
          setStatus(`✅ Gata. ${sent} trimise${failed ? `, ${failed} eșuate` : ''}.`);
          break;
        }
      }
    } catch {
      setError('Eroare de rețea în timpul trimiterii.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen w-full" style={{ background: 'linear-gradient(to bottom, #f7f1e8, #ece0cf)' }}>
      <div className="mx-auto px-4 sm:px-6 max-w-xl w-full py-16">
        <h1 className="text-3xl mb-2" style={{ color: INK, fontFamily: 'var(--font-heading)' }}>
          Broadcast — Psihologia Banilor
        </h1>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
          Trimite un mesaj tuturor participanților înscriși (care au confirmat prin bot).
        </p>

        <div className="space-y-4 rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(184,151,90,0.2)', boxShadow: '0 10px 40px rgba(31,41,51,0.06)' }}>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: INK }}>Parolă</label>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} style={inputStyle} placeholder="Cheia de broadcast" />
          </div>

          <div>
            <button onClick={checkRecipients} disabled={busy} className="text-sm font-semibold underline" style={{ color: GOLD }}>
              Verifică câți destinatari
            </button>
            {count !== null && (
              <span className="ml-2 text-sm" style={{ color: INK }}>
                → <strong>{count}</strong> înscriși
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: INK }}>Mesaj</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className={inputClass} style={inputStyle} placeholder="Ex: Adresa evenimentului este… Te așteptăm sâmbătă la ora 14:00." />
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Poți folosi HTML simplu: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;a href="…"&gt;link&lt;/a&gt;.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: INK }}>Buton (opțional) — text</label>
              <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className={inputClass} style={inputStyle} placeholder="Ex: Vezi locația" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: INK }}>Buton — link</label>
              <input type="url" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} className={inputClass} style={inputStyle} placeholder="https://maps.google.com/…" />
            </div>
          </div>

          {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{error}</div>}
          {status && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#f0f9f0', color: '#166534' }}>{status}</div>}

          <button onClick={send} disabled={busy} className="w-full py-4 rounded-full text-lg font-semibold uppercase tracking-wide transition-all" style={{ background: busy ? '#d1d5db' : 'linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)', color: busy ? '#9ca3af' : '#FFFFFF', cursor: busy ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
            {busy ? 'Se procesează…' : 'Trimite tuturor'}
          </button>
        </div>
      </div>
    </div>
  );
}
