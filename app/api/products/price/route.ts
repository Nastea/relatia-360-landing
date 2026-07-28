import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getProduct, resolveAmount } from '@/lib/products';

/**
 * GET /api/products/price?productId=psihologia_banilor
 *
 * Prețul curent (ține cont de early-bird) + câte locuri au mai rămas la
 * prețul redus. Se numără comenzile plătite.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') || '';
  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 404 });
  }

  let soldPaid = 0;
  try {
    const { count } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('status', 'paid');
    soldPaid = count ?? 0;
  } catch (e) {
    console.error('PRICE_COUNT_ERROR', e);
  }

  const isEarlyBird = !!product.earlyBird && soldPaid < product.earlyBird.limit;
  const earlyBirdRemaining = product.earlyBird
    ? Math.max(0, product.earlyBird.limit - soldPaid)
    : 0;

  return NextResponse.json(
    {
      currency: product.currency,
      currentAmount: resolveAmount(product, soldPaid),
      regularAmount: product.amount,
      earlyBirdAmount: product.earlyBird?.amount ?? null,
      isEarlyBird,
      earlyBirdRemaining,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
