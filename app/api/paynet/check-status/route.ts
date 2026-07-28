import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getApiHost } from '@/lib/paynet';

/**
 * POST /api/paynet/check-status  { orderId }
 *
 * Interoghează Paynet pentru statusul plății (după ExternalID = invoice) și
 * marchează comanda `paid` dacă Paynet raportează Status === 4 (plătit).
 *
 * Este alternativa la callback: funcționează în LIVE fără să depindă de URL-ul
 * de notificare configurat în cabinetul Paynet.
 */
export async function POST(req: Request) {
  try {
    let orderId: string | undefined;
    try {
      orderId = (await req.json())?.orderId;
    } catch {
      return NextResponse.json({ error: 'Missing body' }, { status: 400 });
    }
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, invoice')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    // Deja plătită sau fără invoice Paynet (ex: comandă mock) → nu interogăm Paynet.
    if (order.status === 'paid') return NextResponse.json({ status: 'paid' });
    if (!order.invoice) return NextResponse.json({ status: order.status });

    const apiHost = getApiHost();
    const username = process.env.PAYNET_USERNAME;
    const password = process.env.PAYNET_PASSWORD;
    const merchantCode = process.env.PAYNET_MERCHANT_CODE;
    const saleAreaCode = process.env.PAYNET_SALE_AREA_CODE;
    if (!apiHost || !username || !password) {
      return NextResponse.json({ status: order.status, note: 'paynet_not_configured' });
    }

    // Autentificare (aceeași logică ca la create)
    const tryAuth = async (params: Record<string, string>) => {
      const res = await fetch(`${apiHost}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
      });
      return { ok: res.ok, text: await res.text() };
    };

    let auth = await tryAuth({
      grant_type: 'password',
      username,
      password,
      ...(merchantCode ? { merchantcode: merchantCode } : {}),
      ...(saleAreaCode ? { salearea: saleAreaCode } : {}),
    });
    if (!auth.ok && auth.text.toLowerCase().includes('invalid_grant')) {
      auth = await tryAuth({ grant_type: 'password', username, password });
    }
    if (!auth.ok) {
      console.error('CHECK_STATUS_AUTH_FAILED', auth.text.slice(0, 200));
      return NextResponse.json({ status: order.status, note: 'auth_failed' });
    }

    let token: string | undefined;
    try {
      const j = JSON.parse(auth.text);
      token = j.access_token || j.token;
    } catch {
      /* ignore */
    }
    if (!token) return NextResponse.json({ status: order.status });

    // GET /api/Payments?ExternalID=<invoice>
    const res = await fetch(
      `${apiHost}/api/Payments?ExternalID=${encodeURIComponent(String(order.invoice))}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const text = await res.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return NextResponse.json({ status: order.status, note: 'bad_paynet_response' });
    }

    // Răspunsul poate fi un array de plăți sau { Data: [...] }
    const arr = Array.isArray(payload)
      ? payload
      : ((payload as { Data?: unknown[]; data?: unknown[] })?.Data ??
         (payload as { data?: unknown[] })?.data ??
         []);
    const rec = (Array.isArray(arr) ? arr[0] : arr) as Record<string, unknown> | undefined;
    const paynetStatus = rec?.Status ?? rec?.status;

    // Status === 4 => plătit (per SDK Paynet)
    if (Number(paynetStatus) === 4) {
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          paynet_payload: payload as object,
        })
        .eq('id', order.id)
        .eq('status', 'pending');
      return NextResponse.json({ status: 'paid' });
    }

    return NextResponse.json({ status: order.status, paynetStatus: paynetStatus ?? null });
  } catch (e) {
    console.error('CHECK_STATUS_ERROR', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
