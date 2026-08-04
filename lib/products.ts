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
  /** For 'course' products: public link where all lessons live. */
  courseUrl?: string;
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
      'Acces confirmat ✅\n' +
      'Ai acum acces complet la cursul RELAȚIA 360 – De la conflict la conectare.\n\n' +
      'Toate lecțiile sunt deja publicate și le poți deschide oricând de mai jos. ' +
      'Linkul este public — nu ai nevoie de user sau parolă. 👇',
    courseUrl:
      'https://www.liliadubita.md/app/course/6b8bc0bf-d5b9-4914-b980-b728199d809b',
  },

  // Live event: Psihologia Banilor
  // Preț fix 990 lei — fără modificare automată.
  // Pentru a reactiva early-bird (990 pentru primele 20, apoi 1290):
  //   amount: 1290, earlyBird: { amount: 990, limit: 20 }
  psihologia_banilor: {
    id: 'psihologia_banilor',
    name: 'PSIHOLOGIA BANILOR – Eveniment live',
    description: 'Bilet de participare la evenimentul live Psihologia Banilor',
    amount: 990,
    currency: 'MDL',
    kind: 'event',
    telegramConfirmation:
      'Înscriere confirmată ✅\n' +
      'Ești înscris la evenimentul live PSIHOLOGIA BANILOR.\n\n' +
      '<b>Psihologia Banilor — detalii finale</b>\n' +
      'Iată tot ce trebuie să știi:\n\n' +
      '📅 8 august 2026\n' +
      '🕑 14:00 – 18:00 (4 ore)\n' +
      '📍 SUMMIT, Sala Barcelona, str. Tighina 49/3, Chișinău\n\n' +
      'Ne vedem acolo! 🎉',
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
