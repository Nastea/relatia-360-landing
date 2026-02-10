import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { extractTokenFromText } from '@/lib/token';
import { verifyAccessTokenAndBind } from '@/lib/telegramVerify';
import { sendMessage, sendMainMenu, answerCallbackQuery } from '@/lib/telegram';

type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

// POST /api/telegram/webhook
// Main entrypoint for Telegram bot updates
export async function POST(req: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const siteUrl = process.env.SITE_URL;

    if (!botToken || !siteUrl) {
      console.error('TELEGRAM_WEBHOOK_CONFIG_MISSING');
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const update = await req.json();

    const updateId: number | undefined = update.update_id;
    const message = update.message || update.edited_message || null;
    const callbackQuery = update.callback_query || null;

    const chatId: number | undefined =
      message?.chat?.id ?? callbackQuery?.message?.chat?.id;
    const from: TelegramUser | undefined =
      message?.from ?? callbackQuery?.from ?? undefined;

    console.log('TELEGRAM_UPDATE', {
      updateId,
      chatId,
      fromId: from?.id,
    });

    if (!chatId || !from?.id) {
      // Nothing to do
      return NextResponse.json({ ok: true });
    }

    const telegramUserId = from.id;
    const username = from.username ?? null;
    const now = new Date().toISOString();

    // Upsert telegram_users on any interaction
    await supabaseAdmin.from('telegram_users').upsert(
      {
        telegram_user_id: telegramUserId,
        username,
        first_name: from.first_name ?? null,
        last_name: from.last_name ?? null,
        last_seen_at: now,
      },
      { onConflict: 'telegram_user_id' },
    );

    // Check if user is blocked
    const { data: userRow } = await supabaseAdmin
      .from('telegram_users')
      .select('state, blocked_until')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle();

    const isBlocked =
      userRow?.state === 'BLOCKED' &&
      userRow.blocked_until &&
      new Date(userRow.blocked_until) > new Date();

    if (isBlocked) {
      await sendMessage({
        botToken,
        chatId,
        text: 'Prea multe încercări. Încearcă din nou peste 10 minute.',
      });
      return NextResponse.json({ ok: true });
    }

    // Handle callback queries (menu)
    if (callbackQuery) {
      const data: string | undefined = callbackQuery.data;
      const callbackId: string | undefined = callbackQuery.id;

      if (callbackId) {
        await answerCallbackQuery({
          botToken,
          callbackQueryId: callbackId,
        });
      }

      if (!data) {
        return NextResponse.json({ ok: true });
      }

      switch (data) {
        case 'lesson_1':
          await sendMessage({
            botToken,
            chatId,
            text:
              '📘 Lecția 1\nÎn curând vei găsi aici link direct către conținutul din curs.\nPână atunci, poți accesa materialele pe site:\n' +
              siteUrl,
          });
          break;
        case 'lesson_2':
          await sendMessage({
            botToken,
            chatId,
            text:
              '📗 Lecția 2\nConținutul este în pregătire. Revino curând sau verifică site-ul:\n' +
              siteUrl,
          });
          break;
        case 'exercises':
          await sendMessage({
            botToken,
            chatId,
            text:
              '🧠 Exerciții\nVei primi aici exerciții ghidate după lansarea completă a cursului.\nVezi detalii pe site:\n' +
              siteUrl,
          });
          break;
        case 'support':
          await sendMessage({
            botToken,
            chatId,
            text:
              'Pentru suport, scrie-ne direct aici sau folosește pagina de contact de pe site:\n' +
              siteUrl,
          });
          break;
        default:
          await sendMessage({
            botToken,
            chatId,
            text: 'Opțiune necunoscută. Te rog alege din meniu.',
          });
          break;
      }

      return NextResponse.json({ ok: true });
    }

    // Handle text messages
    const text: string | undefined = message?.text;

    if (!text) {
      // Non-text messages are ignored
      return NextResponse.json({ ok: true });
    }

    const lower = text.toLowerCase().trim();

    // Check if user already has active access
    const { data: existingAccess } = await supabaseAdmin
      .from('telegram_access')
      .select('product_id, revoked_at')
      .eq('telegram_user_id', telegramUserId)
      .is('revoked_at', null)
      .limit(1)
      .maybeSingle();

    const hasActiveAccess = !!existingAccess;

    // /start command
    if (lower.startsWith('/start')) {
      const tokenFromStart = extractTokenFromText(text);

      if (tokenFromStart) {
        // Verify provided token
        await handleTokenVerification({
          botToken,
          siteUrl,
          chatId,
          telegramUserId,
          username,
          token: tokenFromStart,
        });
        return NextResponse.json({ ok: true });
      }

      if (hasActiveAccess) {
        await sendMessage({
          botToken,
          chatId,
          text:
            'Bine ai revenit! Ai deja acces activ la cursul RELAȚIA 360.\nAlege din meniu ce vrei să deschizi.',
        });
        await sendMainMenu({ botToken, chatId, siteUrl });
        return NextResponse.json({ ok: true });
      }

      // No token and no access: ask for token
      await sendAskTokenMessage({ botToken, chatId, siteUrl });
      await supabaseAdmin
        .from('telegram_users')
        .update({ state: 'AWAITING_TOKEN', last_seen_at: now })
        .eq('telegram_user_id', telegramUserId);

      return NextResponse.json({ ok: true });
    }

    // Try to interpret message as token
    const tokenFromText = extractTokenFromText(text);
    if (tokenFromText) {
      await handleTokenVerification({
        botToken,
        siteUrl,
        chatId,
        telegramUserId,
        username,
        token: tokenFromText,
      });
      return NextResponse.json({ ok: true });
    }

    // Fallback: if user has access, just show menu again
    if (hasActiveAccess) {
      await sendMessage({
        botToken,
        chatId,
        text:
          'Ai deja acces la curs. Folosește meniul pentru a naviga între secțiuni.',
      });
      await sendMainMenu({ botToken, chatId, siteUrl });
      return NextResponse.json({ ok: true });
    }

    // Otherwise, remind user to send token
    await sendAskTokenMessage({ botToken, chatId, siteUrl });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('TELEGRAM_WEBHOOK_ERROR', String(error));
    // Always return 200 to avoid Telegram retries
    return NextResponse.json({ ok: true });
  }
}

async function handleTokenVerification(params: {
  botToken: string;
  siteUrl: string;
  chatId: number;
  telegramUserId: number;
  username: string | null;
  token: string;
}): Promise<void> {
  const { botToken, siteUrl, chatId, telegramUserId, username, token } = params;

  const result = await verifyAccessTokenAndBind({
    token,
    telegramUserId,
    username: username ?? undefined,
  });

  if (result.ok) {
    await sendMessage({
      botToken,
      chatId,
      text:
        'Acces confirmat ✅\nAi acum acces la cursul RELAȚIA 360 - De la conflict la conectare.',
    });
    await sendMainMenu({ botToken, chatId, siteUrl });
    return;
  }

  switch (result.reason) {
    case 'NOT_FOUND':
      await sendMessage({
        botToken,
        chatId,
        text:
          'Nu găsesc plata pentru acest cod. Verifică să fie introdus corect sau folosește linkul din pagina de mulțumire.',
      });
      break;
    case 'NOT_PAID':
      await sendMessage({
        botToken,
        chatId,
        text:
          'Plata pentru acest cod nu este încă confirmată. Așteaptă câteva momente și încearcă din nou.',
      });
      break;
    case 'TOKEN_USED_BY_OTHER':
      await sendMessage({
        botToken,
        chatId,
        text:
          'Acest cod a fost deja folosit de un alt cont Telegram. Dacă crezi că este o eroare, contactează suportul.',
      });
      break;
    case 'BAD_FORMAT':
      await sendMessage({
        botToken,
        chatId,
        text:
          'Codul introdus nu pare valid. Te rog copiază exact codul primit pe pagina de mulțumire.',
      });
      break;
    case 'BLOCKED':
    case 'RATE_LIMIT':
      await sendMessage({
        botToken,
        chatId,
        text: 'Prea multe încercări. Încearcă din nou peste 10 minute.',
      });
      break;
    case 'INTERNAL_ERROR':
    default:
      await sendMessage({
        botToken,
        chatId,
        text:
          'A apărut o eroare internă la verificarea codului. Te rog încearcă din nou mai târziu.',
      });
      break;
  }
}

async function sendAskTokenMessage(params: {
  botToken: string;
  chatId: number;
  siteUrl: string;
}): Promise<void> {
  const { botToken, chatId, siteUrl } = params;

  await sendMessage({
    botToken,
    chatId,
    text:
      'Pentru a-ți activa accesul la curs, trimite-mi codul de acces primit pe pagina de mulțumire după plată.\n\n' +
      'Dacă nu ai efectuat încă plata, o poți face aici:',
    replyMarkup: {
      inline_keyboard: [
        [{ text: '🌐 Plătește pe site', url: `${siteUrl}/plata` }],
      ],
    },
  });
}

