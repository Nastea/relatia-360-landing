import { NextResponse } from 'next/server';

// GET /api/telegram/set-webhook?key=...
// Protected endpoint to configure Telegram webhook URL
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    const adminKey = process.env.TELEGRAM_WEBHOOK_ADMIN_KEY;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const siteUrl = process.env.SITE_URL;

    if (!adminKey || !botToken || !siteUrl) {
      console.error('TELEGRAM_SET_WEBHOOK_CONFIG_MISSING');
      return NextResponse.json(
        { ok: false, error: 'Config missing' },
        { status: 500 }
      );
    }

    if (!key || key !== adminKey) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const webhookUrl = `${siteUrl}/api/telegram/webhook`;
    const tgUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

    const res = await fetch(tgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: webhookUrl }),
    });

    const data = await res.json();

    return NextResponse.json({ ok: true, telegram: data });
  } catch (error) {
    console.error('TELEGRAM_SET_WEBHOOK_ERROR', String(error));
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

