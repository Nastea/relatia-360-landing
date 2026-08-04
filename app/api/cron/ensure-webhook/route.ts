import { NextResponse } from 'next/server';

export const maxDuration = 30;

/**
 * GET /api/cron/ensure-webhook
 *
 * Se asigură că webhook-ul Telegram este setat corect pe `${SITE_URL}/api/telegram/webhook`.
 * Rulează periodic (Vercel Cron) ca să auto-repare botul dacă webhook-ul e șters/greșit
 * (exact cauza pentru care cumpărătorii de după 13 iul nu au intrat în bot).
 *
 * Idempotent: dacă webhook-ul e deja corect, nu face nimic.
 * Autorizare: Vercel Cron trimite `Authorization: Bearer $CRON_SECRET`, sau ?key=<TELEGRAM_WEBHOOK_ADMIN_KEY>.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const auth = req.headers.get('authorization') || '';
  const okByHeader =
    process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  const okByKey =
    process.env.TELEGRAM_WEBHOOK_ADMIN_KEY &&
    key === process.env.TELEGRAM_WEBHOOK_ADMIN_KEY;
  if (!okByHeader && !okByKey) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.SITE_URL;
  if (!botToken || !siteUrl) {
    return NextResponse.json(
      { ok: false, error: 'Config missing (TELEGRAM_BOT_TOKEN / SITE_URL)' },
      { status: 500 },
    );
  }

  const desiredUrl = `${siteUrl}/api/telegram/webhook`;

  // Verifică webhook-ul curent.
  let currentUrl = '';
  try {
    const infoRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    );
    const info = await infoRes.json();
    currentUrl = info?.result?.url || '';
  } catch (e) {
    console.error('ENSURE_WEBHOOK_GETINFO_ERROR', String(e));
  }

  if (currentUrl === desiredUrl) {
    return NextResponse.json({ ok: true, changed: false, url: desiredUrl });
  }

  // Setează (re-setează) webhook-ul.
  try {
    const setRes = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: desiredUrl }),
      },
    );
    const setData = await setRes.json();
    console.warn(
      `ENSURE_WEBHOOK_RESET from "${currentUrl}" to "${desiredUrl}"`,
    );
    return NextResponse.json({
      ok: true,
      changed: true,
      previousUrl: currentUrl,
      url: desiredUrl,
      telegram: setData,
    });
  } catch (e) {
    console.error('ENSURE_WEBHOOK_SET_ERROR', String(e));
    return NextResponse.json(
      { ok: false, error: 'setWebhook failed' },
      { status: 502 },
    );
  }
}
