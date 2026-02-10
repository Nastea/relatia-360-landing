'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function PlataSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  const [status, setStatus] = useState<'pending' | 'paid' | 'failed' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramBotUsername, setTelegramBotUsername] = useState<string>('Relatia360Bot');

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

  // Check order status
  useEffect(() => {
    if (!orderId) {
      setError('Missing order ID');
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/orders/status?order=${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order status');
        }

        const data = await response.json();
        setStatus(data.status as 'pending' | 'paid' | 'failed');
        setIsLoading(false);
      } catch (err) {
        console.error('Status check error:', err);
        setError('Eroare la verificarea statusului comenzii');
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [orderId]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    if (orderId) {
      fetch(`/api/orders/status?order=${orderId}`)
        .then(res => res.json())
        .then(data => {
          setStatus(data.status as 'pending' | 'paid' | 'failed');
          setIsLoading(false);
        })
        .catch(() => {
          setError('Eroare la verificarea statusului');
          setIsLoading(false);
        });
    }
  };

  const handleOpenTelegram = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/access?order=${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }

      const data = await response.json();
      const accessToken = data.access_token;

      if (accessToken) {
        const telegramUrl = `https://t.me/${telegramBotUsername}?start=access_${accessToken}`;
        window.open(telegramUrl, '_blank');
      }
    } catch (err) {
      console.error('Telegram open error:', err);
      setError('Nu s-a putut obține codul de acces');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Se verifică plata...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#991b1b' }}>{error}</p>
        {orderId && (
          <button
            onClick={handleRetry}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#E56B6F',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Reîncearcă
          </button>
        )}
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Plata reușită</h1>
        <p style={{ marginBottom: '1.5rem' }}>Plata ta a fost confirmată cu succes.</p>
        <button
          onClick={handleOpenTelegram}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#E56B6F',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Deschide Telegram
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Plata încă nu e confirmată</h1>
      <p style={{ marginBottom: '1.5rem' }}>Te rugăm să aștepți câteva momente.</p>
      <button
        onClick={handleRetry}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#E56B6F',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Reîncearcă
      </button>
    </div>
  );
}

export default function PlataSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Se încarcă...</p>
        </div>
      }
    >
      <PlataSuccessContent />
    </Suspense>
  );
}

