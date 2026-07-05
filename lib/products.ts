/**
 * Product / offer registry.
 *
 * Single source of truth for what a `productId` costs and how it appears on the
 * Paynet invoice. When a productId is found here, the server uses THESE values
 * for price/currency (authoritative — the client cannot override the amount).
 */

export type Currency = 'EUR' | 'MDL';

/** 'course' → grants ongoing course access (shows the course menu on Telegram).
 *  'event'  → a one-off live event ticket (registration confirmation, no menu). */
export type ProductKind = 'course' | 'event';

export type ProductConfig = {
  id: string;
  /** Name shown on the Paynet invoice/service line. */
  name: string;
  /** Short description shown on the Paynet invoice. */
  description: string;
  /** Regular price in major units (e.g. 49 = 49.00). */
  amount: number;
  currency: Currency;
  /** Optional early-bird tier: the first `limit` paid tickets cost `amount`. */
  earlyBird?: { amount: number; limit: number };
  kind: ProductKind;
  /** Message the Telegram bot sends after the access token is verified. */
  telegramConfirmation: string;
};

export const PRODUCTS: Record<string, ProductConfig> = {
  // Existing online course
  relatia360_conflicte: {
    id: 'relatia360_conflicte',
    name: 'RELAȚIA 360 – De la conflict la conectare',
    description: 'Curs practic de comunicare în relații',
    amount: 49,
    currency: 'EUR',
    kind: 'course',
    telegramConfirmation:
      'Acces confirmat ✅\nAi acum acces la cursul RELAȚIA 360 - De la conflict la conectare.',
  },

  // Live event: Psihologia Banilor
  // 990 lei for the first 20 paid tickets, then 1290 lei.
  psihologia_banilor: {
    id: 'psihologia_banilor',
    name: 'PSIHOLOGIA BANILOR – Eveniment live',
    description: 'Bilet de participare la evenimentul live Psihologia Banilor',
    amount: 1290,
    currency: 'MDL',
    earlyBird: { amount: 990, limit: 20 },
    kind: 'event',
    telegramConfirmation:
      'Înscriere confirmată ✅\nEști înscris la evenimentul live PSIHOLOGIA BANILOR. ' +
      'Îți trimitem aici toate detaliile (dată, oră, locație) înainte de eveniment. Ne vedem acolo! 🎉',
  },
};

export function getProduct(id: string): ProductConfig | null {
  return PRODUCTS[id] ?? null;
}

/**
 * Resolves the price to charge, honoring the early-bird tier.
 * `soldCount` = number of tickets already sold (paid) for this product.
 */
export function resolveAmount(product: ProductConfig, soldCount: number): number {
  if (product.earlyBird && soldCount < product.earlyBird.limit) {
    return product.earlyBird.amount;
  }
  return product.amount;
}
