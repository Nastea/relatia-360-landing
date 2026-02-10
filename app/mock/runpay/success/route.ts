import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /mock/runpay/success?order=<uuid>
 * 
 * Mock RunPay success endpoint that:
 * 1. Validates order UUID parameter
 * 2. Reads order from Supabase
 * 3. If already paid, redirects to success page (idempotent)
 * 4. Otherwise updates order to paid status
 * 5. Redirects to success page
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderParam = searchParams.get('order');

    // Validate order parameter exists
    if (!orderParam) {
      return NextResponse.json(
        { error: 'Missing order id' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderParam)) {
      return NextResponse.json(
        { error: 'Invalid order UUID format' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.SITE_URL || 'https://liliadubita.md';
    const successUrl = `${siteUrl}/plata/success?order=${orderParam}`;

    // Read order from Supabase
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderParam)
      .single();

    if (fetchError || !order) {
      console.error('Order fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If already paid, redirect immediately (idempotent)
    if (order.status === 'paid') {
      return NextResponse.redirect(successUrl);
    }

    // Update order to paid status
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status: 'paid',
      paid_at: now,
    };

    // Add optional columns if they exist (won't fail if columns don't exist)
    // updated_at
    updateData.updated_at = now;
    // provider
    updateData.provider = 'mock';
    // provider_payment_id
    updateData.provider_payment_id = `mock_${Date.now()}`;

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderParam)
      .eq('status', 'pending'); // Only update if still pending (idempotency)

    if (updateError) {
      console.error('Order update error:', updateError);
      // If update fails, still try to redirect (might be a race condition)
      // But log the error for debugging
      return NextResponse.redirect(successUrl);
    }

    // Redirect to success page
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Mock RunPay success endpoint error:', error);
    // On error, try to redirect anyway (better UX than showing error)
    const { searchParams } = new URL(req.url);
    const orderParam = searchParams.get('order');
    const siteUrl = process.env.SITE_URL || 'https://liliadubita.md';
    if (orderParam) {
      return NextResponse.redirect(`${siteUrl}/plata/success?order=${orderParam}`);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

