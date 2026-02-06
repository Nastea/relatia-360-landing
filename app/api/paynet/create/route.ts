import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';

function validatePaynetEnvVars(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Required for all modes
  const requiredVars = [
    'PAYNET_ENV',
    'PAYNET_USERNAME',
    'PAYNET_PASSWORD',
    'PAYNET_MERCHANT_CODE',
  ];

  // Check required vars
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  const paynetEnv = process.env.PAYNET_ENV;

  // If in live mode, check live-specific vars
  if (paynetEnv === 'live') {
    if (!process.env.PAYNET_API_HOST_LIVE) {
      missing.push('PAYNET_API_HOST_LIVE');
    }
    if (!process.env.PAYNET_PORTAL_HOST_LIVE) {
      missing.push('PAYNET_PORTAL_HOST_LIVE');
    }
  } else {
    // Test mode (default)
    if (!process.env.PAYNET_API_HOST_TEST) {
      missing.push('PAYNET_API_HOST_TEST');
    }
    if (!process.env.PAYNET_PORTAL_HOST_TEST) {
      missing.push('PAYNET_PORTAL_HOST_TEST');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

function getPaynetConfig() {
  const paynetEnv = process.env.PAYNET_ENV;
  const isLive = paynetEnv === 'live';

  return {
    apiHost: isLive 
      ? process.env.PAYNET_API_HOST_LIVE 
      : process.env.PAYNET_API_HOST_TEST,
    portalHost: isLive
      ? process.env.PAYNET_PORTAL_HOST_LIVE
      : process.env.PAYNET_PORTAL_HOST_TEST,
    username: process.env.PAYNET_USERNAME!,
    password: process.env.PAYNET_PASSWORD!,
    merchantCode: process.env.PAYNET_MERCHANT_CODE!,
  };
}

export async function POST(req: Request) {
  try {
    // Validate environment variables first
    const validation = validatePaynetEnvVars();
    if (!validation.isValid) {
      console.error('Missing Paynet environment variables:', validation.missing.join(', '));
      return NextResponse.json(
        {
          error: 'Paynet configuration missing',
          missing: validation.missing,
        },
        { status: 500 }
      );
    }

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

    const paynetConfig = getPaynetConfig();

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
      username: paynetConfig.username,
      password: paynetConfig.password,
    });

    const authResponse = await fetch(`${paynetConfig.apiHost}/auth`, {
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
      MerchantCode: paynetConfig.merchantCode,
      Currency: 498, // MDL
      Services: [
        {
          Amount: amount,
        },
      ],
    };

    const paymentResponse = await fetch(`${paynetConfig.apiHost}/api/Payments`, {
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
    const paymentUrl = `${paynetConfig.portalHost}/Acquiring/GetEcom?operation=${paymentId}&Lang=ro`;

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

