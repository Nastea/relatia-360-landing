import { NextResponse } from 'next/server';
import { getApiHost, formatPaynetDate } from '@/lib/paynet';

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
        // Test Payments/Send with Reg.json structure
        const testInvoice = Math.floor(Date.now() / 1000); // Small integer (10 digits max)
        const testOrderId = 'test-' + testInvoice;
        const amountValue = 1; // Use amount directly (1 MDL, not 100 minor units)

        // Product with ALL fields in EXACT order matching Reg.json template
        const productTotalAmount = amountValue;
        const product = {
          GroupName: null,
          QualitiesConcat: null,
          LineNo: 1,
          GroupId: null,
          Code: 'relatia360',
          Barcode: 3601,
          Name: 'RELAȚIA 360 – De la conflict la conectare',
          Description: 'Acces online',
          UnitPrice: amountValue, // Integer (1, not 100)
          UnitProduct: null,
          Quantity: 1, // Integer
          Amount: null,
          Dimensions: null,
          Qualities: null,
          TotalAmount: productTotalAmount, // Integer
        };

        // Build payload with keys in EXACT order matching Reg.json
        const testRegPayload = {
          Invoice: testInvoice, // NUMBER (small integer)
          MerchantCode: process.env.PAYNET_MERCHANT_CODE, // STRING
          LinkUrlSuccess: 'https://liliadubita.md/multumim?order=' + testOrderId,
          LinkUrlCancel: 'https://liliadubita.md/plata?cancel=1&order=' + testOrderId,
          Signature: null,
          SignVersion: 'v01',
          Customer: {
            Code: 'no-reply@liliadubita.md',
            Name: 'Customer',
            NameFirst: 'Customer',
            NameLast: 'Customer',
            email: 'no-reply@liliadubita.md',
            Country: 'Moldova',
            City: 'Chisinau',
            Address: 'Online',
            PhoneNumber: '79306530', // 8 digits
          },
          Payer: null,
          Currency: 498,
          ExternalDate: formatPaynetDate(new Date()),
          ExpiryDate: formatPaynetDate(new Date(Date.now() + 2 * 60 * 60 * 1000)),
          Services: [
            {
              Name: 'RELAȚIA 360',
              Description: 'Curs practic de comunicare în relații',
              Amount: productTotalAmount, // Must equal sum of Products[].TotalAmount (1, not 100)
              Products: [product],
            },
          ],
          MoneyType: null,
        };

        console.log('DEBUG_PAYNET_REG_PAYLOAD', JSON.stringify(testRegPayload));

        const paymentResponse = await fetch(`${apiHost}/api/Payments/Send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testRegPayload),
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

