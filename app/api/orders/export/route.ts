import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/orders/export?key=<ORDERS_EXPORT_KEY>[&product=psihologia_banilor][&all=1]
 *
 * Descarcă un CSV (deschidabil în Excel) cu datele persoanelor care au cumpărat.
 * Implicit doar comenzile plătite; `all=1` include și cele în așteptare.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const adminKey = process.env.ORDERS_EXPORT_KEY;

  if (!adminKey) {
    return new Response('Export key not configured', { status: 500 });
  }
  if (!key || key !== adminKey) {
    return new Response('Forbidden', { status: 403 });
  }

  const product = searchParams.get('product');
  const includeAll = searchParams.get('all') === '1';

  let query = supabaseAdmin
    .from('orders')
    .select(
      'created_at, paid_at, customer_first_name, customer_last_name, customer_email, customer_phone, amount, currency, product_id, status, telegram_username, telegram_user_id, access_token',
    )
    .order('paid_at', { ascending: false, nullsFirst: false });

  if (!includeAll) query = query.eq('status', 'paid');
  if (product) query = query.eq('product_id', product);

  const { data, error } = await query;
  if (error) {
    return new Response(`DB error: ${error.message}`, { status: 500 });
  }

  const headers = [
    'Data platii',
    'Prenume',
    'Nume',
    'Email',
    'Telefon',
    'Suma',
    'Moneda',
    'Produs',
    'Telegram',
    'In bot',
    'Link Telegram',
    'Bilete (email)',
    'Status',
  ];

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'liliadubita_bot';

  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  // Câte comenzi are fiecare email (>1 = a luat mai multe bilete).
  const emailCounts: Record<string, number> = {};
  for (const o of data ?? []) {
    const e = (o.customer_email || '').toLowerCase().trim();
    if (e) emailCounts[e] = (emailCounts[e] || 0) + 1;
  }

  const rows = (data ?? []).map((o) => {
    const email = (o.customer_email || '').toLowerCase().trim();
    const inBot = o.telegram_user_id ? 'Da' : 'Nu';
    const tickets = email ? emailCounts[email] : 1;
    const telegramLink = o.access_token
      ? `https://t.me/${botUsername}?start=access_${o.access_token}`
      : '';
    return [
      o.paid_at || o.created_at || '',
      o.customer_first_name || '',
      o.customer_last_name || '',
      o.customer_email || '',
      o.customer_phone || '',
      o.amount ?? '',
      o.currency || '',
      o.product_id || '',
      o.telegram_username || '',
      inBot,
      telegramLink,
      tickets,
      o.status || '',
    ]
      .map(esc)
      .join(',');
  });

  // BOM ca Excel să afișeze corect diacriticele. Pentru Google Sheets
  // (IMPORTDATA) folosește ?bom=0 ca să nu apară caractere în primul antet.
  const useBom = searchParams.get('bom') !== '0';
  const csv = (useBom ? '﻿' : '') + [headers.map(esc).join(','), ...rows].join('\r\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="participanti-${product || 'toate'}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
