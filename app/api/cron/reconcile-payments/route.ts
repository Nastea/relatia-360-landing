import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getApiHost } from '@/lib/paynet';

export const maxDuration = 60;

/**
 * GET /api/cron/reconcile-payments?key=<ORDERS_EXPORT_KEY>
 *
 * Ia comenzile `pending` recente (cu invoice Paynet) și verifică la Paynet dacă
 * au fost de fapt plătite (Status === 4). Marchează automat pe cele plătite.
 *
 * Rulează periodic (Vercel Cron sau extern) — recuperează cumpărătorii care au
 * plătit dar nu s-au întors pe pagina de mulțumire.
 * Autorizare: Vercel Cron trimite `Authorization: Bearer $CRON_SECRET`, sau ?key=.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const auth = req.headers.get('authorization') || '';
  const okByHeader = process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  const okByKey = process.env.ORDERS_EXPORT_KEY && key === process.env.ORDERS_EXPORT_KEY;
  if (!okByHeader && !okByKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const apiHost = getApiHost();
  const username = process.env.PAYNET_USERNAME;
  const password = process.env.PAYNET_PASSWORD;
  const merchantCode = process.env.PAYNET_MERCHANT_CODE;
  const saleAreaCode = process.env.PAYNET_SALE_AREA_CODE;
  if (!apiHost || !username || !password) {
    return NextResponse.json({ error: 'Paynet not configured' }, { status: 500 });
  }

  // Comenzi pending din ultimele 4 zile, care au un invoice Paynet.
  const since = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const { data: pending, error } = await supabaseAdmin
    .from('orders')
    .select('id, invoice')
    .eq('status', 'pending')
    .not('invoice', 'is', null)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!pending || pending.length === 0) {
    return NextResponse.json({ checked: 0, confirmed: 0, confirmedIds: [] });
  }

  // Autentificare Paynet (o singură dată).
  const tryAuth = async (params: Record<string, string>) => {
    const res = await fetch(`${apiHost}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });
    return { ok: res.ok, text: await res.text() };
  };
  let a = await tryAuth({
    grant_type: 'password',
    username,
    password,
    ...(merchantCode ? { merchantcode: merchantCode } : {}),
    ...(saleAreaCode ? { salearea: saleAreaCode } : {}),
  });
  if (!a.ok && a.text.toLowerCase().includes('invalid_grant')) {
    a = await tryAuth({ grant_type: 'password', username, password });
  }
  if (!a.ok) {
    return NextResponse.json({ error: 'Paynet auth failed' }, { status: 502 });
  }
  let token: string | undefined;
  try {
    const j = JSON.parse(a.text);
    token = j.access_token || j.token;
  } catch {
    /* ignore */
  }
  if (!token) return NextResponse.json({ error: 'No Paynet token' }, { status: 502 });

  const confirmedIds: string[] = [];
  for (const order of pending) {
    try {
      const res = await fetch(
        `${apiHost}/api/Payments?ExternalID=${encodeURIComponent(String(order.invoice))}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const payload = JSON.parse(await res.text());
      const arr = Array.isArray(payload)
        ? payload
        : (payload?.Data ?? payload?.data ?? []);
      const rec = Array.isArray(arr) ? arr[0] : arr;
      const status = rec?.Status ?? rec?.status;
      if (Number(status) === 4) {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid', paid_at: new Date().toISOString(), paynet_payload: payload })
          .eq('id', order.id)
          .eq('status', 'pending');
        confirmedIds.push(order.id);
      }
    } catch (e) {
      console.error('RECONCILE_ORDER_ERROR', order.id, String(e));
    }
  }

  return NextResponse.json({ checked: pending.length, confirmed: confirmedIds.length, confirmedIds });
}
