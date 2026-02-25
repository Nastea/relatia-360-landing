'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MultumimContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed' | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramBotUsername, setTelegramBotUsername] = useState<string>('Relatia360Bot');
  const [confirming, setConfirming] = useState(false);

  // Fetch Telegram bot username from API
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.telegramBotUsername) {
          setTelegramBotUsername(data.telegramBotUsername);
        }
      })
      .catch(() => {
        // Use default if API fails
      });
  }, []);

  // Poll order status
  useEffect(() => {
    if (!orderId) {
      setError('Missing order ID');
      setIsLoading(false);
      return;
    }

    let pollInterval: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 5 minutes (5s * 60)

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/orders/status?order=${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order status');
        }

        const data = await response.json();
        setStatus(data.status as 'pending' | 'paid' | 'failed');

        // If paid, fetch access token
        if (data.status === 'paid' && !accessToken) {
          const accessResponse = await fetch(`/api/orders/access?order=${orderId}`);
          if (accessResponse.ok) {
            const accessData = await accessResponse.json();
            setAccessToken(accessData.access_token);
          }
        }

        // After first response we're done "loading" so user can see confirm button if still pending
        setIsLoading(false);

        // Stop polling if paid or failed
        if (data.status === 'paid' || data.status === 'failed') {
          if (pollInterval) clearInterval(pollInterval);
        } else {
          pollCount++;
          if (pollCount >= maxPolls) {
            if (pollInterval) clearInterval(pollInterval);
            setError('Timeout waiting for payment confirmation');
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
        setError('Eroare la verificarea statusului comenzii');
        setIsLoading(false);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 5 seconds if still pending
    if (status === 'pending' || status === null) {
      pollInterval = setInterval(checkStatus, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, status, accessToken]);

  const telegramUrl = accessToken
    ? `https://t.me/${telegramBotUsername}?start=access_${accessToken}`
    : `https://t.me/${telegramBotUsername}`;

  const handleConfirmTest = async () => {
    if (!orderId || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch('/api/paynet/confirm-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Nu s-a putut confirma plata');
        setConfirming(false);
        return;
      }
      setStatus('paid');
      setIsLoading(false);
      const accessRes = await fetch(`/api/orders/access?order=${orderId}`);
      if (accessRes.ok) {
        const accessData = await accessRes.json();
        setAccessToken(accessData.access_token);
      }
    } catch {
      setError('Eroare la confirmare');
      setConfirming(false);
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
                className="inline-block px-6 py-3 rounded-lg font-mono text-sm"
                style={{ 
                  backgroundColor: "#faf8f5",
                  color: "#1F2933",
                  border: "1px solid #e5d9c8",
                }}
              >
                {orderId || '—'}
              </div>
            </div>

            {/* Status Message */}
            {isLoading && status === 'pending' && (
              <div className="text-center space-y-4">
                <p className="text-lg" style={{ color: "#6B7280" }}>
                  Se confirmă plata…
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#E56B6F" }}></div>
                </div>
              </div>
            )}

            {/* Buton confirmare manuală când Paynet nu trimite callback */}
            {!isLoading && status === 'pending' && orderId && (
              <div
                className="p-4 rounded-lg text-sm text-center"
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #f59e0b",
                }}
              >
                <p className="mb-3">
                  Nu se confirmă automat? Dacă ai finalizat deja plata, apasă butonul de mai jos.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmTest}
                  disabled={confirming}
                  className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "#d97706" }}
                >
                  {confirming ? 'Se confirmă...' : 'Am plătit deja – confirmă plata'}
                </button>
              </div>
            )}

            {status === 'paid' && accessToken && (
              <>
                {/* Success Message */}
                <div className="text-center space-y-4 pb-8 border-b" style={{ borderColor: "#e5d9c8" }}>
                  <p className="text-lg font-semibold" style={{ color: "#1F2933" }}>
                    ✅ Plata a fost confirmată!
                  </p>
                  <p className="text-sm" style={{ color: "#6B7280" }}>
                    Accesează cursul în Telegram folosind butonul de mai jos.
                  </p>
                </div>

                {/* Telegram Button */}
                <div className="pt-4">
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
              </>
            )}

            {status === 'failed' && (
              <div className="text-center space-y-4">
                <p className="text-lg" style={{ color: "#991b1b" }}>
                  Plata nu a putut fi procesată.
                </p>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  Te rugăm să contactezi suportul pentru asistență.
                </p>
              </div>
            )}

            {error && (
              <div 
                className="p-4 rounded-lg text-sm text-center"
                style={{ 
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                }}
              >
                {error}
              </div>
            )}

            {/* Info Note */}
            {status === 'paid' && (
              <div className="pt-4 text-center">
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  Accesul la curs va fi activat imediat după ce apeși butonul de mai sus.
                </p>
              </div>
            )}
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

