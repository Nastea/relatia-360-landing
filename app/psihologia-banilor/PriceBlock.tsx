'use client';

import { useEffect, useState } from 'react';

const INK = '#1F2933';
const MUTED = '#6B7280';
const GOLD = '#B8975A';

type Price = {
  currency: string;
  currentAmount: number;
  regularAmount: number;
  earlyBirdAmount: number | null;
  isEarlyBird: boolean;
  earlyBirdRemaining: number;
};

type Props = {
  productId: string;
  /** Valori inițiale (fallback până se încarcă prețul live), ca să nu apară gol. */
  earlyBirdAmount: number;
  regularAmount: number;
};

export default function PriceBlock({ productId, earlyBirdAmount, regularAmount }: Props) {
  const [p, setP] = useState<Price | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/products/price?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        if (active && d && !d.error) setP(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [productId]);

  const current = p ? p.currentAmount : earlyBirdAmount;
  const early = p ? p.isEarlyBird : false;
  const remaining = p ? p.earlyBirdRemaining : null;

  return (
    <div>
      <p className="text-sm uppercase tracking-wide mb-3" style={{ color: MUTED }}>
        Preț bilet
      </p>
      <div
        className="text-5xl md:text-6xl mb-3"
        style={{ color: INK, fontFamily: 'var(--font-heading)' }}
      >
        {current} lei
      </div>

      {early ? (
        <>
          <div
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: 'rgba(184,151,90,0.12)', border: `1px solid ${GOLD}` }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: GOLD }}>
              {remaining != null && remaining > 0
                ? `Mai sunt ${remaining} locuri la ${earlyBirdAmount} lei`
                : 'Preț early-bird'}
            </span>
          </div>
          <p className="text-sm mb-8" style={{ color: MUTED }}>
            apoi {regularAmount} lei
          </p>
        </>
      ) : (
        <div
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full mb-8"
          style={{ backgroundColor: 'rgba(184,151,90,0.12)', border: `1px solid ${GOLD}` }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: GOLD }}>
            Preț standard
          </span>
        </div>
      )}
    </div>
  );
}
