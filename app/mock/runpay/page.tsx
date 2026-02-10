'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function MockRunPayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMockPayment = async () => {
    if (!orderId) {
      setError('Missing order ID');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate successful payment by calling webhook
      const response = await fetch('/api/runpay/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          status: 'Settled',
          paymentId: `mock-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process payment');
      }

      // Redirect to thank you page
      router.push(`/multumim?order=${orderId}`);
    } catch (err) {
      console.error('Mock payment error:', err);
      setError(err instanceof Error ? err.message : 'A apărut o eroare');
      setIsProcessing(false);
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
            MOCK RUNPAY<br />
            CHECKOUT
          </h1>

          <div 
            className="rounded-2xl p-8 md:p-12 space-y-8"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Order Info */}
            <div className="text-center space-y-4 pb-8 border-b" style={{ borderColor: "#e5d9c8" }}>
              <p className="text-lg" style={{ color: "#6B7280" }}>
                Order ID:
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
              <p className="text-sm mt-4" style={{ color: "#6B7280" }}>
                This is a mock payment page for testing.
              </p>
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

            {/* Mock Payment Button */}
            <button
              onClick={handleMockPayment}
              disabled={isProcessing || !orderId}
              className="w-full py-4 rounded-lg text-lg font-semibold uppercase tracking-wide transition-all"
              style={{
                background: !isProcessing && orderId
                  ? "linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)"
                  : "#d1d5db",
                color: !isProcessing && orderId ? "#FFFFFF" : "#9ca3af",
                boxShadow: !isProcessing && orderId
                  ? "0 4px 12px rgba(229, 107, 111, 0.4)"
                  : "none",
                cursor: !isProcessing && orderId ? "pointer" : "not-allowed",
                opacity: !isProcessing && orderId ? 1 : 0.6,
              }}
            >
              {isProcessing ? "Se procesează..." : "Simulează plată reușită"}
            </button>

            {/* Info Note */}
            <div className="pt-4 text-center">
              <p className="text-sm" style={{ color: "#6B7280" }}>
                ⚠️ Mock mode - This simulates a successful payment
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MockRunPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #f5ede3, #ebdfce)" }}>
        <p style={{ color: "#6B7280" }}>Se încarcă...</p>
      </div>
    }>
      <MockRunPayContent />
    </Suspense>
  );
}

