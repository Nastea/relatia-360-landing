import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Log received payload for debugging
    console.log('Paynet callback received:', JSON.stringify(payload, null, 2));

    // Try to find order_id from various possible fields
    let orderId: string | null = null;
    
    if (payload.order_id) {
      orderId = payload.order_id;
    } else if (payload.orderId) {
      orderId = payload.orderId;
    } else if (payload.invoice_id) {
      orderId = payload.invoice_id;
    }

    // Check if payment was successful
    const isSuccess = 
      payload.status === 'success' || 
      payload.success === true ||
      payload.status === 'paid' ||
      payload.paid === true;

    // If we have an order_id and payment is successful, update the order
    if (orderId && isSuccess) {
      const updateData: any = {
        status: 'paid',
        paid_at: new Date().toISOString(),
        paynet_payload: payload,
      };

      // Add transaction_id if it exists
      if (payload.transaction_id) {
        updateData.paynet_transaction_id = payload.transaction_id;
      } else if (payload.transactionId) {
        updateData.paynet_transaction_id = payload.transactionId;
      }

      const { error } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('order_id', orderId);

      if (error) {
        console.error('Supabase update error:', error);
        // Still return 200 to avoid retries
      } else {
        console.log(`Order ${orderId} marked as paid`);
      }
    }

    // Always return 200 OK quickly to avoid retries
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Callback error:', error);
    // Still return 200 to avoid retries from Paynet
    return NextResponse.json({ ok: true });
  }
}

