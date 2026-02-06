import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';

const PAYNET_API_HOST = process.env.PAYNET_API_HOST || 'https://api.paynet.md';
const PAYNET_PORTAL_HOST = process.env.PAYNET_PORTAL_HOST || 'https://paynet.md';
const PAYNET_MERCHANT_CODE = process.env.PAYNET_MERCHANT_CODE;
const PAYNET_USERNAME = process.env.PAYNET_USERNAME;
const PAYNET_PASSWORD = process.env.PAYNET_PASSWORD;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, amount, currency = 'MDL' } = body;

    // Validation
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return NextResponse.json(
        { error: 'productId is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount is required and must be a positive number' },
        { status: 400 }
      );
    }

    if (!PAYNET_MERCHANT_CODE || !PAYNET_USERNAME || !PAYNET_PASSWORD) {
      return NextResponse.json(
        { error: 'Paynet configuration missing' },
        { status: 500 }
      );
    }

    // Generate order_id and invoice
    const orderId = randomUUID();
    const invoice = BigInt(Date.now()); // Use timestamp as invoice number

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: orderId,
        product_id: productId,
        amount: amount,
        currency: currency,
        status: 'pending',
        invoice: invoice.toString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Authenticate with Paynet
    const authParams = new URLSearchParams({
      username: PAYNET_USERNAME,
      password: PAYNET_PASSWORD,
    });

    const authResponse = await fetch(`${PAYNET_API_HOST}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: authParams.toString(),
    });

    if (!authResponse.ok) {
      console.error('Paynet auth failed:', authResponse.status, await authResponse.text());
      return NextResponse.json(
        { error: 'Failed to authenticate with Paynet' },
        { status: 500 }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token || authData.token;

    if (!accessToken) {
      console.error('No access token in auth response:', authData);
      return NextResponse.json(
        { error: 'Failed to get access token from Paynet' },
        { status: 500 }
      );
    }

    // Create payment
    const paymentBody = {
      Invoice: invoice.toString(),
      MerchantCode: PAYNET_MERCHANT_CODE,
      Currency: 498, // MDL
      Services: [
        {
          Amount: amount,
        },
      ],
    };

    const paymentResponse = await fetch(`${PAYNET_API_HOST}/api/Payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentBody),
    });

    if (!paymentResponse.ok) {
      console.error('Paynet payment creation failed:', paymentResponse.status, await paymentResponse.text());
      return NextResponse.json(
        { error: 'Failed to create payment with Paynet' },
        { status: 500 }
      );
    }

    const paymentData = await paymentResponse.json();
    const paymentId = paymentData.PaymentID || paymentData.id || paymentData.ID;

    if (!paymentId) {
      console.error('No PaymentID in response:', paymentData);
      return NextResponse.json(
        { error: 'Failed to get payment ID from Paynet' },
        { status: 500 }
      );
    }

    // Update order with paynet_payment_id
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ paynet_payment_id: paymentId.toString() })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update order with payment ID:', updateError);
      // Continue anyway, payment was created
    }

    // Build payment URL
    const paymentUrl = `${PAYNET_PORTAL_HOST}/Acquiring/GetEcom?operation=${paymentId}&Lang=ro`;

    return NextResponse.json({
      order_id: orderId,
      payment_url: paymentUrl,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

