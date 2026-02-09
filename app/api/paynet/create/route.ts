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
  // Version guard to confirm new code is deployed
  console.log('PAYNET_CREATE_HANDLER_VERSION', 'attempts-v2');

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

    // Generate order_id and invoice ONCE (reuse for all attempts)
    const orderId = randomUUID();
    // Generate invoice as small integer (10 digits max) matching Reg.json style
    const invoice = Math.floor(Date.now() / 1000);

    // Insert into Supabase ONCE before trying any Paynet attempts
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

    // Authenticate with Paynet (include salearea in auth per Postman example)
    const authParams = new URLSearchParams({
      grant_type: 'password',
      username: process.env.PAYNET_USERNAME!,
      password: process.env.PAYNET_PASSWORD!,
      merchantcode: merchantCode,
      salearea: saleAreaCode,
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

    // Build base URL for callbacks
    const baseUrl = callbackUrl.replace('/api/paynet/callback', '');
    // Date formatter: ISO without milliseconds and without 'Z'
    const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, '');

    // Define 12 attempts: try both endpoints, both SignVersions, with/without SaleAreaCode
    // A-D: /api/Payments/Send (from Postman/Reg.json) - NO SaleAreaCode (matching Reg.json)
    // E-H: /api/Payments/Send - WITH SaleAreaCode (for v0.5)
    // I-L: /api/Payments - WITH SaleAreaCode (v0.5 endpoint)
    const attempts = [
      { id: 'A', endpoint: 'Send', signVersion: 'v01', amountValue: Math.round(amount * 100), includeSaleArea: false, description: '/api/Payments/Send, v01, minor, no SaleAreaCode' },
      { id: 'B', endpoint: 'Send', signVersion: 'v01', amountValue: Math.round(amount), includeSaleArea: false, description: '/api/Payments/Send, v01, major, no SaleAreaCode' },
      { id: 'C', endpoint: 'Send', signVersion: 'v05', amountValue: Math.round(amount * 100), includeSaleArea: false, description: '/api/Payments/Send, v05, minor, no SaleAreaCode' },
      { id: 'D', endpoint: 'Send', signVersion: 'v05', amountValue: Math.round(amount), includeSaleArea: false, description: '/api/Payments/Send, v05, major, no SaleAreaCode' },
      { id: 'E', endpoint: 'Send', signVersion: 'v01', amountValue: Math.round(amount * 100), includeSaleArea: true, description: '/api/Payments/Send, v01, minor, WITH SaleAreaCode' },
      { id: 'F', endpoint: 'Send', signVersion: 'v01', amountValue: Math.round(amount), includeSaleArea: true, description: '/api/Payments/Send, v01, major, WITH SaleAreaCode' },
      { id: 'G', endpoint: 'Send', signVersion: 'v05', amountValue: Math.round(amount * 100), includeSaleArea: true, description: '/api/Payments/Send, v05, minor, WITH SaleAreaCode' },
      { id: 'H', endpoint: 'Send', signVersion: 'v05', amountValue: Math.round(amount), includeSaleArea: true, description: '/api/Payments/Send, v05, major, WITH SaleAreaCode' },
      { id: 'I', endpoint: '', signVersion: 'v01', amountValue: Math.round(amount * 100), includeSaleArea: true, description: '/api/Payments, v01, minor, WITH SaleAreaCode' },
      { id: 'J', endpoint: '', signVersion: 'v01', amountValue: Math.round(amount), includeSaleArea: true, description: '/api/Payments, v01, major, WITH SaleAreaCode' },
      { id: 'K', endpoint: '', signVersion: 'v05', amountValue: Math.round(amount * 100), includeSaleArea: true, description: '/api/Payments, v05, minor, WITH SaleAreaCode' },
      { id: 'L', endpoint: '', signVersion: 'v05', amountValue: Math.round(amount), includeSaleArea: true, description: '/api/Payments, v05, major, WITH SaleAreaCode' },
    ];

    const attemptResults: Array<{ attempt: string; status: number; body: string }> = [];

    // Try each attempt in order, stop on first success
    for (const attempt of attempts) {
      console.log('PAYNET_ATTEMPT', attempt.id);

      // Build payload INSIDE the loop for each attempt
      // Reuse invoice as small numeric (already generated above)
      const invoiceNumber = invoice; // Small number, ~10 digits

      // Build product matching Reg.json structure exactly
      const chosenAmount = attempt.amountValue;
      const product = {
        GroupName: null,
        QualitiesConcat: null,
        LineNo: 1,
        GroupId: null,
        Code: 'relatia360',
        Barcode: 3601,
        Name: 'RELAȚIA 360 – De la conflict la conectare',
        Description: 'Acces online',
        UnitPrice: chosenAmount, // int
        UnitProduct: null,
        Quantity: 1, // int
        Amount: null,
        Dimensions: null,
        Qualities: null,
        TotalAmount: chosenAmount, // int - sum of UnitPrice * Quantity
      };

      // Build payload matching Reg.json structure exactly
      const regPayload: any = {
        Invoice: invoiceNumber, // NUMBER (small integer, ~10 digits)
        MerchantCode: merchantCode, // STRING "982657"
        // Include SaleAreaCode only if attempt.includeSaleArea is true
        ...(attempt.includeSaleArea && { SaleAreaCode: saleAreaCode }),
        LinkUrlSuccess: `${baseUrl}/multumim?order=${orderId}`,
        LinkUrlCancel: `${baseUrl}/plata?cancel=1&order=${orderId}`,
        Signature: null,
        SignVersion: attempt.signVersion, // v01 or v05 per attempt
        Customer: {
          Code: 'no-reply@liliadubita.md', // Email-like as in Reg.json
          Name: 'Customer',
          NameFirst: 'Customer',
          NameLast: 'Customer',
          email: 'no-reply@liliadubita.md',
          Country: 'Moldova',
          City: 'Chisinau',
          Address: 'Online',
          PhoneNumber: '79306530', // 8-digit numeric string
        },
        Payer: null,
        Currency: 498, // int 498 for MDL
        ExternalDate: iso(new Date()), // "YYYY-MM-DDTHH:mm:ss"
        ExpiryDate: iso(new Date(Date.now() + 2 * 60 * 60 * 1000)), // +2 hours
        Services: [
          {
            Name: 'RELAȚIA 360',
            Description: 'Curs practic de comunicare în relații',
            Amount: chosenAmount, // Uppercase Amount (matching Reg.json)
            Products: [product], // Uppercase Products (matching Reg.json)
          },
        ],
        MoneyType: null,
      };

      // CRITICAL LOGGING: Log the exact payload that will be sent
      console.log('PAYNET_ATTEMPT', attempt.id);
      console.log('PAYNET_PAYLOAD_SENT', JSON.stringify(regPayload));

      // Try this attempt - use the payload built INSIDE this loop
      // Try both endpoints: /api/Payments/Send (Reg.json) and /api/Payments (v0.5)
      const endpointPath = attempt.endpoint ? `/api/Payments/${attempt.endpoint}` : '/api/Payments';
      const paymentResponse = await fetch(`${apiHost}${endpointPath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regPayload), // Use payload built in this loop iteration
      });

      const paymentResponseText = await paymentResponse.text();
      console.log('PAYNET_PAYMENTS_STATUS', paymentResponse.status);
      console.log('PAYNET_PAYMENTS_BODY', paymentResponseText);

      // Record attempt result
      attemptResults.push({
        attempt: attempt.id,
        status: paymentResponse.status,
        body: paymentResponseText,
      });

      // If successful, stop and return
      if (paymentResponse.ok) {
        let paymentData;
        try {
          paymentData = JSON.parse(paymentResponseText);
        } catch (e) {
          console.error('PAYNET PAYMENTS PARSE ERROR', e);
          // Continue to next attempt if parse fails
          continue;
        }

        const paymentId = paymentData.PaymentID || paymentData.id || paymentData.ID;
        const signature = paymentData.Signature || paymentData.signature;

        if (!paymentId) {
          console.error('No PaymentID in response:', paymentData);
          // Continue to next attempt
          continue;
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

        // Return success with attempt info
        return NextResponse.json({
          ok: true,
          order_id: orderId,
          invoice: String(invoice),
          payment_id: paymentId.toString(),
          signature: signature || null,
          attempt: attempt.id,
          redirect_base: 'https://test.paynet.md/acquiring/getecom',
        });
      }

      // If not successful, continue to next attempt
      console.log(`PAYNET_ATTEMPT ${attempt.id} failed, trying next...`);
    }

    // All attempts failed
    return NextResponse.json(
      {
        error: 'PAYNET_PAYMENTS_FAILED',
        attempts: attemptResults,
        note: 'All 4 attempts (A, B, C, D) failed. Check PAYNET_ATTEMPT logs in Vercel.',
      },
      { status: 502 }
    );
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

