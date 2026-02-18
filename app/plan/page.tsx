'use client';

import { useState, useEffect } from 'react';

const PASSWORD = '1111';

export default function PlanPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem('plan_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('plan_auth', 'true');
      setError('');
    } else {
      setError('Parolă incorectă');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #f5ede3, #ebdfce)',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            width: '90%',
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#1F2933',
              textAlign: 'center',
            }}
          >
            Acces Protejat
          </h1>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#6B7280',
                  fontSize: '0.875rem',
                }}
              >
                Parolă:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                autoFocus
              />
              {error && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#E56B6F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Accesează
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render markmap after authentication
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/markmap-content.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Markmap"
      />
    </div>
  );
}

