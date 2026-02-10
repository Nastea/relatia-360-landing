import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomBytes } from 'crypto';

/**
 * POST /api/checkout/create
 * Creates an order in Supabase and returns a payment URL (mock or real RunPay)
 * 
 * Input: { productId: "relatia360" }
 * Output: { url: string, orderId: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId = 'relatia360' } = body;

    // Validate productId
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid productId' },
        { status: 400 }
      );
    }

    // Product configuration (can be moved to a config file later)
    const productConfig: Record<string, { amount: number; currency: string }> = {
      relatia360: { amount: 990, currency: 'MDL' },
    };

    const config = productConfig[productId];
    if (!config) {
      return NextResponse.json(
        { error: 'Unknown productId' },
        { status: 400 }
      );
    }

    // Generate secure access token (32+ characters)
    const accessToken = randomBytes(24).toString('base64url');

    // Create order in Supabase
    const { data: order, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        product_id: productId,
        amount: config.amount,
        currency: config.currency,
        status: 'pending',
        access_token: accessToken,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create order', details: insertError.message },
        { status: 500 }
      );
    }

    const runpayMode = process.env.RUNPAY_MODE || 'mock';
    const siteUrl = process.env.SITE_URL || 'https://liliadubita.md';

    let paymentUrl: string;

    if (runpayMode === 'mock') {
      // Mock mode: redirect to mock RunPay success endpoint (simulates payment)
      paymentUrl = `${siteUrl}/mock/runpay/success?order=${order.id}`;
    } else {
      // TODO: Real RunPay integration
      // When RUNPAY_MODE=live and credentials are available:
      // 1. Call RunPay API: POST ${RUNPAY_BASE_URL}/api/v2/invoices
      // 2. Headers:
      //    - Authorization: Bearer ${RUNPAY_BEARER_TOKEN}
      //    - Idempotency-Key: ${order.id}
      //    - Content-Type: application/json
      // 3. Body:
      //    {
      //      merchantId: process.env.RUNPAY_MERCHANT_ID,
      //      invoice: {
      //        description: "RELAȚIA 360 - De la conflict la conectare",
      //        params: {
      //          order_id: order.id,
      //          access_token: accessToken
      //        }
      //      },
      //      amount: {
      //        value: config.amount,
      //        currency: config.currency
      //      },
      //      paymentMethod: "BankCard",
      //      testMode: process.env.RUNPAY_TEST_MODE === 'true'
      //    }
      // 4. Store returned paymentId and url in order:
      //    - runpay_payment_id = response.paymentId
      //    - runpay_payload = full response
      // 5. Return response.url as paymentUrl
      
      return NextResponse.json(
        { 
          error: 'RunPay live mode not yet configured',
          note: 'Set RUNPAY_MODE=mock for testing, or configure RUNPAY_BASE_URL, RUNPAY_BEARER_TOKEN, RUNPAY_MERCHANT_ID for live mode'
        },
        { status: 501 }
      );
    }

    return NextResponse.json({
      url: paymentUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Checkout create error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

