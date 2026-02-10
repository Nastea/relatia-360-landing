import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/orders/access?order=<uuid>
 * Returns access_token ONLY if order status is 'paid'
 * Used by /multumim page to get Telegram deep link token
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order parameter' },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('status, access_token')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Order access fetch error:', error);
      return NextResponse.json(
        { error: 'Order not found', details: error.message },
        { status: 404 }
      );
    }

    // Only return access_token if order is paid
    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order not paid yet' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      access_token: order.access_token,
    });
  } catch (error) {
    console.error('Order access error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

