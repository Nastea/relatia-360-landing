import { NextResponse } from 'next/server';
import { getApiHost } from '@/lib/paynet';

export async function POST(req: Request) {
  // Only allow in TEST mode
  if (process.env.PAYNET_ENV !== 'test') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in TEST mode' },
      { status: 404 }
    );
  }

  try {
    const apiHost = getApiHost();
    const username = process.env.PAYNET_USERNAME;
    const password = process.env.PAYNET_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Paynet credentials not configured' },
        { status: 500 }
      );
    }

    // Test AUTH
    const authParams = new URLSearchParams({
      grant_type: 'password',
      username: username,
      password: password,
    });

    const authResponse = await fetch(`${apiHost}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: authParams.toString(),
    });

    const authStatus = authResponse.status;
    const authBody = await authResponse.text();

    let paymentsStatus = null;
    let paymentsBody = null;

    if (authResponse.ok) {
      let authData;
      try {
        authData = JSON.parse(authBody);
      } catch (e) {
        return NextResponse.json({
          ok: false,
          authStatus,
          authBody,
          error: 'Failed to parse auth response',
        });
      }

      const accessToken = authData.access_token || authData.token;

      if (accessToken) {
        // Test Payments/Send with minimal payload
        const testPaymentBody = {
          Invoice: Date.now().toString(),
          MerchantCode: process.env.PAYNET_MERCHANT_CODE,
          SaleAreaCode: process.env.PAYNET_SALE_AREA_CODE,
          Currency: 498,
          Services: [{ Amount: 1 }],
          Customer: '',
          Description: 'Test payment',
        };

        console.log('DEBUG_PAYNET_PAYLOAD', JSON.stringify(testPaymentBody));

        const paymentResponse = await fetch(`${apiHost}/api/Payments/Send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPaymentBody),
        });

        paymentsStatus = paymentResponse.status;
        paymentsBody = await paymentResponse.text();
        console.log('DEBUG_PAYNET_PAYMENTS_STATUS', paymentsStatus);
        console.log('DEBUG_PAYNET_PAYMENTS_BODY', paymentsBody);
      }
    }

    return NextResponse.json({
      ok: authStatus === 200 && paymentsStatus === 200,
      authStatus,
      authBody: authStatus === 200 ? '[OK - token received]' : authBody,
      paymentsStatus,
      paymentsBody,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: String((e as any)?.message ?? e),
      },
      { status: 500 }
    );
  }
}

