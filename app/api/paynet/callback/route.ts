import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createHash } from 'crypto';

const PAYNET_SECRET_KEY = process.env.PAYNET_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const hashHeader = req.headers.get('Hash');

    // Log received payload for debugging
    console.log('Paynet callback received:', JSON.stringify(payload, null, 2));
    console.log('Hash header:', hashHeader);

    if (!PAYNET_SECRET_KEY) {
      console.error('PAYNET_SECRET_KEY not configured');
      return NextResponse.json({ ok: true }); // Return 200 to avoid retries
    }

    // Verify signature
    if (hashHeader) {
      const payment = payload.Payment || payload.payment || {};
      
      // Build PreparedString exactly as per Paynet docs
      const preparedString = 
        (payload.EventDate || '') +
        (payload.Eventid || payload.EventId || '') +
        (payload.EventType || '') +
        (payment.Amount || '') +
        (payment.Customer || '') +
        (payment.ExternalID || payment.ExternalId || '') +
        (payment.ID || payment.Id || '') +
        (payment.Merchant || '') +
        (payment.StatusDate || '');

      // Compute hash: Base64(MD5(PreparedString + SECRET_KEY))
      const hashInput = preparedString + PAYNET_SECRET_KEY;
      const md5Hash = createHash('md5').update(hashInput).digest();
      const computedHash = Buffer.from(md5Hash).toString('base64');

      if (hashHeader !== computedHash) {
        console.error('Hash verification failed');
        console.error('Expected:', computedHash);
        console.error('Received:', hashHeader);
        console.error('PreparedString:', preparedString);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }

      console.log('Hash verification successful');
    }

    // Process Paid event
    if (payload.EventType === 'Paid' || payload.eventType === 'Paid') {
      const payment = payload.Payment || payload.payment || {};
      const externalId = payment.ExternalID || payment.ExternalId;

      if (externalId) {
        // Find order by invoice (ExternalID)
        const { data: order, error: findError } = await supabaseAdmin
          .from('orders')
          .select('order_id')
          .eq('invoice', externalId.toString())
          .single();

        if (findError) {
          console.error('Order not found for invoice:', externalId, findError);
        } else if (order) {
          const updateData: any = {
            status: 'paid',
            paid_at: new Date().toISOString(),
            paynet_payload: payload,
          };

          // Add paynet_payment_id if it exists
          const paymentId = payment.ID || payment.Id;
          if (paymentId) {
            updateData.paynet_payment_id = paymentId.toString();
          }

          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('order_id', order.order_id);

          if (updateError) {
            console.error('Supabase update error:', updateError);
          } else {
            console.log(`Order ${order.order_id} marked as paid (invoice: ${externalId})`);
          }
        }
      } else {
        console.warn('No ExternalID in Payment object');
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

