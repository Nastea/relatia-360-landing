import { NextResponse } from 'next/server';

// Handle Telegram webhook updates
// POST /api/telegram/webhook
export async function POST(req: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const siteUrl = process.env.SITE_URL;

    if (!botToken || !siteUrl) {
      console.error('TELEGRAM_WEBHOOK_CONFIG_MISSING');
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const update = await req.json();

    // Extract basic info (do NOT log tokens)
    const updateId = update.update_id;
    const message = update.message || update.edited_message;
    const chatId = message?.chat?.id;
    const text: string | undefined = message?.text;

    console.log('TELEGRAM_UPDATE', { updateId, chatId });

    if (!chatId || !text) {
      // Nothing to do
      return NextResponse.json({ ok: true });
    }

    // Try to extract token from /start access_<token> or plain token text
    let token: string | null = null;

    if (text.startsWith('/start')) {
      // /start or /start access_<token>
      const parts = text.split(' ');
      if (parts.length > 1 && parts[1].startsWith('access_')) {
        token = parts[1].substring('access_'.length);
      }
    } else {
      // If message looks like a token (e.g. contains letters/numbers and length >= 16)
      const candidate = text.trim();
      if (/^[a-zA-Z0-9_-]{16,}$/.test(candidate)) {
        token = candidate;
      }
    }

    if (!token) {
      // Friendly message if no token detected
      await sendTelegramMessage(botToken, chatId, {
        text: 'Trimite-mi linkul sau codul de acces primit pe pagina de mulțumire ca să îți pot confirma plata.',
      });
      return NextResponse.json({ ok: true });
    }

    // Call our verification endpoint (do NOT log token)
    const verifyUrl = `${siteUrl}/api/telegram/verify?token=${encodeURIComponent(token)}`;
    const verifyRes = await fetch(verifyUrl, {
      method: 'GET',
    });

    const verifyData = await verifyRes.json();

    if (verifyRes.ok && verifyData.ok) {
      // Access confirmed
      const courseUrl = `${siteUrl}/curs?token=${encodeURIComponent(token)}`;
      const supportUrl = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'Relatia360Bot'}`;

      await sendTelegramMessage(botToken, chatId, {
        text: 'Acces confirmat ✅',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Deschide cursul', url: courseUrl },
            ],
            [
              { text: 'Suport', url: supportUrl },
            ],
          ],
        },
      });
    } else {
      // Invalid or unpaid token
      await sendTelegramMessage(botToken, chatId, {
        text: 'Nu găsesc plata pentru acest cod. Verifică linkul din pagina de mulțumim sau reîncearcă.',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('TELEGRAM_WEBHOOK_ERROR', String(error));
    return NextResponse.json({ ok: true });
  }
}

// Helper to call Telegram sendMessage
async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  payload: { text: string; reply_markup?: any }
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const body = {
    chat_id: chatId,
    text: payload.text,
    reply_markup: payload.reply_markup,
    parse_mode: 'HTML',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('TELEGRAM_SEND_MESSAGE_ERROR', { status: res.status, body: text });
    }
  } catch (err) {
    console.error('TELEGRAM_SEND_MESSAGE_NETWORK_ERROR', String(err));
  }
}

