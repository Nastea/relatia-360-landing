import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/telegram/verify?token=<access_token>&consume=1
 * Verifies access token and returns product info if valid
 * Used by Telegram bot to unlock access
 * 
 * If consume=1, marks access_used_at to prevent reuse
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const consume = searchParams.get('consume') === '1';

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    // Find order by access_token
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, product_id, status, access_used_at')
      .eq('access_token', token)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { ok: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check if order is paid
    if (order.status !== 'paid') {
      return NextResponse.json(
        { ok: false, error: 'Order not paid' },
        { status: 403 }
      );
    }

    // Check if token already used (if consume is required)
    if (order.access_used_at && consume) {
      return NextResponse.json(
        { ok: false, error: 'Token already used' },
        { status: 403 }
      );
    }

    // Mark as used if consume flag is set
    if (consume && !order.access_used_at) {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ access_used_at: new Date().toISOString() })
        .eq('id', order.id);

      if (updateError) {
        console.error('Token consume error:', updateError);
        // Continue anyway, return success
      }
    }

    return NextResponse.json({
      ok: true,
      productId: order.product_id,
    });
  } catch (error) {
    console.error('Telegram verify error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

