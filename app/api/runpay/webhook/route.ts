import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/runpay/webhook
 * Handles RunPay payment webhooks (both mock and real)
 * 
 * Mock input: { orderId: "<uuid>", status: "Settled", paymentId: "mock-123" }
 * Real RunPay will send different structure - TODO: adapt when credentials available
 * 
 * Security: TODO - Add signature verification when RunPay provides webhook secret
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log webhook event (never log sensitive tokens)
    console.log('RUNPAY_WEBHOOK_RECEIVED', {
      hasOrderId: !!body.orderId,
      status: body.status,
      paymentId: body.paymentId || body.payment_id,
      eventId: body.id || body.eventId,
    });

    // Extract order identifier
    // Mock mode: direct orderId
    // Real RunPay: may be in invoice.params.order_id or other field
    const orderId = body.orderId || body.invoice?.params?.order_id || body.order_id;
    const status = body.status || body.paymentStatus;
    const paymentId = body.paymentId || body.payment_id || `mock-${Date.now()}`;

    if (!orderId) {
      console.error('RUNPAY_WEBHOOK_ERROR: No orderId found in webhook body');
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // Only process "Settled" status (payment successful)
    if (status === 'Settled' || status === 'settled' || status === 'paid') {
      // Update order to paid status
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          runpay_payment_id: paymentId,
          runpay_payload: body, // Store full webhook event
        })
        .eq('id', orderId)
        .eq('status', 'pending'); // Only update if still pending (idempotency)

      if (updateError) {
        console.error('RUNPAY_WEBHOOK_UPDATE_ERROR', updateError);
        return NextResponse.json(
          { error: 'Failed to update order', details: updateError.message },
          { status: 500 }
        );
      }

      console.log('RUNPAY_WEBHOOK_SUCCESS', { orderId, paymentId });
    } else {
      // Log other statuses but don't update order
      console.log('RUNPAY_WEBHOOK_IGNORED', { orderId, status });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('RUNPAY_WEBHOOK_ERROR', error);
    // Still return 200 to prevent retries on our errors
    return NextResponse.json(
      { error: 'Webhook processing error', details: String(error) },
      { status: 200 }
    );
  }
}

