import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/orders/status?order=<uuid>
 * Returns order status and paid_at timestamp
 * Used by /multumim page for polling
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
      .select('status, paid_at')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Order status fetch error:', error);
      return NextResponse.json(
        { error: 'Order not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: order.status,
      paidAt: order.paid_at,
    });
  } catch (error) {
    console.error('Order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

