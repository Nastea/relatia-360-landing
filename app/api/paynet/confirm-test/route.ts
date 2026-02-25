import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function markOrderPaid(orderId: string) {
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { ok: false, error: 'Order not found' };
  }
  if (order.status === 'paid') {
    return { ok: true, alreadyPaid: true };
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      paynet_payload: { _test_confirm: true, at: new Date().toISOString() },
    })
    .eq('id', orderId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }
  return { ok: true };
}

/**
 * POST /api/paynet/confirm-test
 * Body: { orderId: string }
 * When PAYNET_ENV is test or not set. Marks order as paid. Used by the "Confirmă plata" button on /multumim.
 */
export async function POST(req: Request) {
  const env = process.env.PAYNET_ENV;
  if (env === 'live') {
    return NextResponse.json({ error: 'Only available in test env' }, { status: 404 });
  }
  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Missing body' }, { status: 400 });
  }
  const orderId = body?.orderId;
  if (!orderId || typeof orderId !== 'string') {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }
  const result = await markOrderPaid(orderId);
  if (!result.ok) {
    const status = (result as { error?: string }).error === 'Order not found' ? 404 : 500;
    return NextResponse.json(
      { error: (result as { error?: string }).error || 'Update failed' },
      { status }
    );
  }
  return NextResponse.json({ ok: true, alreadyPaid: (result as { alreadyPaid?: boolean }).alreadyPaid });
}

/**
 * GET /api/paynet/confirm-test?order=ORDER_ID&key=SECRET
 * When not live. Marks order as paid (key optional if PAYNET_TEST_CONFIRM_KEY not set). Redirects to /multumim.
 */
export async function GET(req: Request) {
  if (process.env.PAYNET_ENV === 'live') {
    return NextResponse.json({ error: 'Only available in test env' }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order');
  const key = searchParams.get('key');
  const secret = process.env.PAYNET_TEST_CONFIRM_KEY;

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order' }, { status: 400 });
  }
  if (secret && key !== secret) {
    return NextResponse.json({ error: 'Invalid or missing key' }, { status: 403 });
  }

  const result = await markOrderPaid(orderId);
  if (!result.ok) {
    const status = (result as { error?: string }).error === 'Order not found' ? 404 : 500;
    return NextResponse.json(
      { error: (result as { error?: string }).error || 'Update failed' },
      { status }
    );
  }
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  return NextResponse.redirect(`${base}/multumim?order=${orderId}`);
}
