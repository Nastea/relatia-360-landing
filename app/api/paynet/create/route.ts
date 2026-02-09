import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getApiHost, getPortalHost } from '@/lib/paynet';
import { randomUUID } from 'crypto';

function validatePaynetEnvVars(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Required for all modes
  const requiredVars = [
    'PAYNET_ENV',
    'PAYNET_USERNAME',
    'PAYNET_PASSWORD',
    'PAYNET_MERCHANT_CODE',
    'PAYNET_SALE_AREA_CODE',
    'PAYNET_CALLBACK_URL',
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
    if (!process.env.PAYNET_NOTIFY_SECRET_KEY_LIVE) {
      missing.push('PAYNET_NOTIFY_SECRET_KEY_LIVE');
    }
  } else {
    // Test mode (default)
    if (!process.env.PAYNET_API_HOST_TEST) {
      missing.push('PAYNET_API_HOST_TEST');
    }
    if (!process.env.PAYNET_PORTAL_HOST_TEST) {
      missing.push('PAYNET_PORTAL_HOST_TEST');
    }
    if (!process.env.PAYNET_NOTIFY_SECRET_KEY_TEST) {
      missing.push('PAYNET_NOTIFY_SECRET_KEY_TEST');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
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
          error: 'PAYNET_CONFIG_MISSING',
          missing: validation.missing,
        },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        {
          error: 'BAD_REQUEST',
          details: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    const { productId, amount, currency = 'MDL' } = body;

    // Body validation
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return NextResponse.json(
        {
          error: 'BAD_REQUEST',
          details: 'productId is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          error: 'BAD_REQUEST',
          details: 'amount is required and must be a positive number',
        },
        { status: 400 }
      );
    }

    // Generate order_id and invoice
    const orderId = randomUUID();
    // Generate invoice with collision avoidance: timestamp * 1000 + random 3 digits
    const invoice = BigInt(Date.now()) * BigInt(1000) + BigInt(Math.floor(Math.random() * 1000));

    // Insert into Supabase
    const { data, error: insertError } = await supabaseAdmin
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

    if (insertError) {
      console.error('SUPABASE INSERT ERROR', insertError);
      return NextResponse.json(
        {
          error: 'SUPABASE_INSERT_FAILED',
          details: insertError.message,
          code: insertError.code ?? null,
          hint: insertError.hint ?? null,
        },
        { status: 500 }
      );
    }

    const apiHost = getApiHost();
    const portalHost = getPortalHost();
    const merchantCode = process.env.PAYNET_MERCHANT_CODE!;
    const saleAreaCode = process.env.PAYNET_SALE_AREA_CODE!;
    const callbackUrl = process.env.PAYNET_CALLBACK_URL!;

    // Authenticate with Paynet
    const authParams = new URLSearchParams({
      grant_type: 'password',
      username: process.env.PAYNET_USERNAME!,
      password: process.env.PAYNET_PASSWORD!,
    });

    const authResponse = await fetch(`${apiHost}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: authParams.toString(),
    });

    if (!authResponse.ok) {
      const authErrorText = await authResponse.text();
      console.error('PAYNET ERROR', authResponse.status, authErrorText);
      return NextResponse.json(
        {
          error: 'PAYNET_API_ERROR',
          step: 'auth',
          status: authResponse.status,
          details: authErrorText,
        },
        { status: 502 }
      );
    }

    let authData;
    try {
      authData = await authResponse.json();
    } catch (e) {
      console.error('PAYNET AUTH PARSE ERROR', e);
      return NextResponse.json(
        {
          error: 'PAYNET_AUTH_FAILED',
          details: 'Failed to parse auth response',
        },
        { status: 502 }
      );
    }

    const accessToken = authData.access_token || authData.token;

    if (!accessToken) {
      console.error('No access token in auth response:', authData);
      return NextResponse.json(
        {
          error: 'PAYNET_AUTH_FAILED',
          details: 'No access_token in response',
        },
        { status: 502 }
      );
    }

    // Create payment
    const paymentBody: any = {
      Invoice: invoice.toString(),
      MerchantCode: merchantCode,
      SaleAreaCode: saleAreaCode,
      Currency: 498, // MDL
      Services: [
        {
          Amount: amount,
        },
      ],
    };

    const paymentResponse = await fetch(`${apiHost}/api/Payments/Send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentBody),
    });

    if (!paymentResponse.ok) {
      const paymentErrorText = await paymentResponse.text();
      console.error('PAYNET ERROR', paymentResponse.status, paymentErrorText);
      return NextResponse.json(
        {
          error: 'PAYNET_API_ERROR',
          step: 'payments',
          status: paymentResponse.status,
          details: paymentErrorText,
        },
        { status: 502 }
      );
    }

    let paymentData;
    try {
      paymentData = await paymentResponse.json();
    } catch (e) {
      console.error('PAYNET PAYMENTS PARSE ERROR', e);
      return NextResponse.json(
        {
          error: 'PAYNET_API_ERROR',
          step: 'payments',
          details: 'Failed to parse payment response',
        },
        { status: 502 }
      );
    }

    const paymentId = paymentData.PaymentID || paymentData.id || paymentData.ID;
    const signature = paymentData.Signature || paymentData.signature;

    if (!paymentId) {
      console.error('No PaymentID in response:', paymentData);
      return NextResponse.json(
        {
          error: 'PAYNET_API_ERROR',
          step: 'payments',
          details: 'No PaymentID in response',
        },
        { status: 502 }
      );
    }

    // Update order with paynet_payment_id
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ paynet_payment_id: Number(paymentId) })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update order with payment ID:', updateError);
      // Continue anyway, payment was created
    }

    // Return payment details for frontend to handle redirect
    return NextResponse.json({
      order_id: orderId,
      invoice: invoice.toString(),
      payment_id: paymentId.toString(),
      signature: signature || null,
      redirect_base: 'https://test.paynet.md/acquiring/getecom',
    });
  } catch (e) {
    console.error('PAYNET CREATE FATAL', e);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: String((e as any)?.message ?? e),
      },
      { status: 500 }
    );
  }
}

