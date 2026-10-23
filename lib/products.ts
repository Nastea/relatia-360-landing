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
  /** Optional later price. Charged from `from` (ISO date-time) on; without `from`
   *  it is only announced on the landing ("după închiderea preînscrierilor"). */
  priceIncrease?: { from?: string; amount: number };
  kind: ProductKind;
  /** Message the Telegram bot sends after the access token is verified. */
  telegramConfirmation: string;
  /** For 'course' products: public link where all lessons live. */
  courseUrl?: string;
  /** Optional email sent to the buyer once the order is paid (via Resend). */
  paidEmail?: {
    subject: string;
    html: (firstName: string) => string;
    /** Optional PDF from `private/`, sent as an attachment. */
    attachment?: { file: string; filename: string };
  };
};

// ---------------------------------------------------------------------------
// Intensiv „Am un plan pentru viața mea" — detalii livrate după plată.
// TODO(Lilia): completează data la care se închid preînscrierile.
// ---------------------------------------------------------------------------
export const INTENSIV = {
  /** Ziua 1 a planului de 60 de zile (folosită și de calendarul de pe landing). */
  startDate: '2026-11-07',
  dateText: 'sâmbătă, 7 noiembrie 2026',
  timeText: '10:00–16:00, cu pauză de prânz 12:00–13:00',
  telegramGroupUrl: 'https://t.me/+bOjSEN9TGAEyYTVi',
  /** Gol până avem linkul: atunci mesajele spun că linkul vine în grup. */
  zoomUrl: 'https://us05web.zoom.us/j/3669097947?pwd=OUh0YlFLeldjOXEyMzA5b3o3ZER4QT09',
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

  // Intensiv online (Zoom) + caiet de lucru.
  // Preînscriere 20 €; după închiderea preînscrierilor 30 €.
  intensiv_plan: {
    id: 'intensiv_plan',
    name: 'INTENSIV – Am un plan pentru viața mea',
    description: 'Participare la intensivul online + caiet de lucru',
    // Plata reală se face pe liliadubita.md/intensiv (LMS). Aici rămâne aceeași sumă,
    // pentru comenzi confirmate prin reconcile/check-status ale acestui proiect.
    amount: 400,
    currency: 'MDL',
    // TODO(Lilia): adaugă `from` (ex. '2026-11-01T00:00:00+02:00') ca prețul de 30 €
    // să se aplice automat de la acea dată. Fără `from`, se percep 20 €.
    // priceIncrease: { amount: 30 },
    kind: 'event',
    telegramConfirmation:
      'Înscriere confirmată ✅\n' +
      'Ești înscris la intensivul <b>„Am un plan pentru viața mea"</b>.\n\n' +
      `📅 ${INTENSIV.dateText}\n` +
      `🕑 ${INTENSIV.timeText}\n` +
      '💻 Online, pe Zoom\n\n' +
      `👥 Intră în grupul participanților: ${INTENSIV.telegramGroupUrl}\n` +
      (INTENSIV.zoomUrl
        ? `🔗 Link Zoom: ${INTENSIV.zoomUrl}\n\n`
        : '🔗 Linkul de Zoom îl publicăm în grup înainte de intensiv.\n\n') +
      'Caietul de lucru e atașat la emailul de confirmare: printează-l înainte de intensiv. Ne vedem acolo! 🌿',
    paidEmail: {
      subject: 'Ești înscris la intensivul „Am un plan pentru viața mea"',
      attachment: { file: 'caiet-intensiv.pdf', filename: 'Caiet de lucru - Am un plan pentru viata mea.pdf' },
      html: (firstName) => `
<p>Bună${firstName ? `, ${escapeHtml(firstName)}` : ''}!</p>
<p>Plata a fost confirmată și ești înscris la intensivul <strong>„Am un plan pentru viața mea"</strong>.</p>
<p><strong>Când:</strong> ${INTENSIV.dateText}, ${INTENSIV.timeText}<br><strong>Unde:</strong> online, pe Zoom</p>
<p><strong>Caietul de lucru e atașat la acest email.</strong> Te rugăm să-l <strong>printezi înainte de intensiv</strong> (7 pagini A4) și să-l ai lângă tine pe 7 noiembrie, împreună cu un pix. Îl completăm împreună, pas cu pas.</p>
<p><strong>1. Intră în grupul de Telegram al participanților</strong><br>
Acolo primești anunțurile și reminder-ele.<br>
<a href="${INTENSIV.telegramGroupUrl}">${INTENSIV.telegramGroupUrl}</a></p>
<p><strong>2. ${INTENSIV.zoomUrl ? 'Păstrează linkul de Zoom' : 'Linkul de Zoom'}</strong><br>
${INTENSIV.zoomUrl ? `<a href="${INTENSIV.zoomUrl}">${INTENSIV.zoomUrl}</a>` : 'Îl publicăm în grupul participanților înainte de intensiv.'}</p>
<p>Ai întrebări? Scrie-ne la <a href="mailto:danexprim@liliadubita.md">danexprim@liliadubita.md</a> sau sună la 067 102 290.</p>
<p>Cu drag,<br>Lilia Dubița</p>
`.trim(),
    },
  },
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function getProduct(id: string): ProductConfig | null {
  return PRODUCTS[id] ?? null;
}

/**
 * Resolves the price to charge, honoring the early-bird and date tiers.
 * `soldCount` = number of tickets already sold (paid) for this product.
 */
export function resolveAmount(
  product: ProductConfig,
  soldCount: number,
  now: Date = new Date(),
): number {
  if (product.earlyBird && soldCount < product.earlyBird.limit) {
    return product.earlyBird.amount;
  }
  const later = product.priceIncrease;
  if (later?.from && now >= new Date(later.from)) {
    return later.amount;
  }
  return product.amount;
}
