import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMessage } from '@/lib/telegram';

export const maxDuration = 60;

type Body = {
  key?: string;
  message?: string;
  product?: string;
  buttonText?: string;
  buttonUrl?: string;
  dryRun?: boolean;
  offset?: number;
  limit?: number;
};

/**
 * POST /api/telegram/broadcast
 *
 * Trimite un mesaj tuturor utilizatorilor cu acces activ la un produs
 * (cei care s-au înscris și au confirmat prin bot).
 *
 * Se procesează în loturi: clientul apelează repetat cu offset crescător
 * până când `done: true`, ca să nu dea timeout la mulți destinatari.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Missing body' }, { status: 400 });
  }

  const adminKey = process.env.BROADCAST_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: 'Broadcast key not configured' }, { status: 500 });
  }
  if (!body.key || body.key !== adminKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
  }

  const product = (body.product || 'psihologia_banilor').trim();

  // Preview: doar numărul de destinatari.
  if (body.dryRun) {
    const { count, error } = await supabaseAdmin
      .from('telegram_access')
      .select('telegram_user_id', { count: 'exact', head: true })
      .eq('product_id', product)
      .is('revoked_at', null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ total: count ?? 0 });
  }

  const message = (body.message || '').trim();
  if (!message) {
    return NextResponse.json({ error: 'Mesajul este gol.' }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number(body.limit) || 40, 1), 100);
  const offset = Math.max(Number(body.offset) || 0, 0);

  const { data: rows, error } = await supabaseAdmin
    .from('telegram_access')
    .select('telegram_user_id')
    .eq('product_id', product)
    .is('revoked_at', null)
    .order('telegram_user_id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = Array.from(new Set((rows ?? []).map((r) => r.telegram_user_id))).filter(
    (id): id is number => typeof id === 'number',
  );

  const replyMarkup =
    body.buttonText && body.buttonUrl
      ? { inline_keyboard: [[{ text: body.buttonText, url: body.buttonUrl }]] }
      : undefined;

  let sent = 0;
  let failed = 0;
  for (const chatId of ids) {
    try {
      await sendMessage({ botToken, chatId, text: message, replyMarkup });
      sent++;
    } catch (e) {
      console.error('BROADCAST_SEND_FAILED', chatId, String(e));
      failed++;
    }
  }

  // done = am primit mai puține rânduri decât limita (nu mai sunt destinatari).
  const done = (rows ?? []).length < limit;
  return NextResponse.json({ sent, failed, processed: ids.length, nextOffset: offset + limit, done });
}
