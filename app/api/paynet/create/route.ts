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
    // Generate invoice as <= 13 digits numeric safe (not BigInt string)
    const invoice = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);

    // Insert into Supabase
    const { data, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: orderId,
        product_id: productId,
        amount: amount,
        currency: currency,
        status: 'pending',
        invoice: String(invoice),
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
      console.error('PAYNET AUTH STATUS', authResponse.status);
      console.error('PAYNET AUTH BODY', authErrorText);
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

    // Build Reg.json payload structure for Payments/Send
    const baseUrl = callbackUrl.replace('/api/paynet/callback', '');
    const amountMinor = Math.round(amount * 100); // Convert to minor units (990 MDL -> 99000)

    // Normalize date format: ISO without milliseconds and without Z
    const isoNoMs = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, '');

    const regPayload: any = {
      Invoice: invoice, // Send as NUMBER (not string)
      MerchantCode: Number(merchantCode), // Ensure numeric
      SaleAreaCode: saleAreaCode, // Add missing SaleAreaCode
      Currency: 498, // MDL
      SignVersion: 'v01',
      LinkUrlSuccess: `${baseUrl}/multumim?order=${orderId}`,
      LinkUrlCancel: `${baseUrl}/plata?cancel=1&order=${orderId}`,
      ExternalDate: isoNoMs(new Date()),
      ExpiryDate: isoNoMs(new Date(Date.now() + 2 * 60 * 60 * 1000)), // +2 hours
      Customer: {
        Code: orderId,
        Name: 'Customer',
        NameFirst: 'Customer',
        NameLast: 'Customer',
        email: 'no-reply@liliadubita.md',
        Country: 'Moldova',
        City: 'Chisinau',
        Address: 'Online',
        PhoneNumber: '00000000',
      },
      Services: [
        {
          Name: 'RELAȚIA 360',
          Description: 'Curs practic de comunicare în relații',
          Amount: amountMinor,
          Products: [
            {
              LineNo: 1,
              Code: 'relatia360',
              Barcode: 3601,
              Name: 'RELAȚIA 360 – De la conflict la conectare',
              Description: 'Acces online',
              UnitPrice: amountMinor,
              Quantity: 1,
              TotalAmount: amountMinor,
            },
          ],
        },
      ],
    };

    // Log payload for debugging (no secrets exposed)
    console.log('PAYNET_REG_PAYLOAD', JSON.stringify(regPayload));

    const paymentResponse = await fetch(`${apiHost}/api/Payments/Send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(regPayload),
    });

    const paymentResponseText = await paymentResponse.text();
    console.log('PAYNET_PAYMENTS_STATUS', paymentResponse.status);
    console.log('PAYNET_PAYMENTS_BODY', paymentResponseText);

    if (!paymentResponse.ok) {
      return NextResponse.json(
        {
          error: 'PAYNET_PAYMENTS_FAILED',
          status: paymentResponse.status,
          details: paymentResponseText,
          note: 'Check PAYNET_REG_PAYLOAD in Vercel logs',
        },
        { status: 502 }
      );
    }

    let paymentData;
    try {
      paymentData = JSON.parse(paymentResponseText);
    } catch (e) {
      console.error('PAYNET PAYMENTS PARSE ERROR', e);
      return NextResponse.json(
        {
          error: 'PAYNET_PAYMENTS_FAILED',
          status: paymentResponse.status,
          details: paymentResponseText,
          note: 'Failed to parse payment response as JSON',
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
          error: 'PAYNET_PAYMENTS_FAILED',
          status: paymentResponse.status,
          details: paymentResponseText,
          note: 'No PaymentID in response',
        },
        { status: 502 }
      );
    }

    // Update order with paynet_payment_id and signature
    const updateData: any = {
      paynet_payment_id: Number(paymentId),
    };

    if (signature) {
      updateData.paynet_signature = signature;
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update order with payment ID:', updateError);
      // Continue anyway, payment was created
    }

    // Return payment details for frontend to handle redirect
    return NextResponse.json({
      order_id: orderId,
      invoice: String(invoice),
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

