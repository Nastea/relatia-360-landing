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
        // Test Payments/Send with Reg.json structure
        const testInvoice = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
        const testOrderId = 'test-' + testInvoice;
        const amountMinor = 100; // 1 MDL in minor units

        // Normalize date format: "YYYY-MM-DDTHH:mm:ss" (no milliseconds, no Z)
        const formatDate = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const seconds = String(d.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        // Product with all required fields matching Reg.json template
        const productTotalAmount = amountMinor;
        const product = {
          LineNo: 1,
          Code: 'relatia360',
          Barcode: 3601,
          Name: 'RELAȚIA 360 – De la conflict la conectare',
          Description: 'Acces online',
          UnitPrice: amountMinor, // Integer
          Quantity: 1, // Integer
          TotalAmount: productTotalAmount, // Integer
          GroupName: null,
          QualitiesConcat: null,
          GroupId: null,
          Amount: null,
          UnitProduct: null,
          Dimensions: null,
          Qualities: null,
        };

        const testRegPayload = {
          Invoice: testInvoice, // NUMBER
          MerchantCode: process.env.PAYNET_MERCHANT_CODE, // STRING
          SaleAreaCode: process.env.PAYNET_SALE_AREA_CODE,
          Currency: 498,
          SignVersion: 'v01',
          Signature: null,
          Payer: null,
          MoneyType: null,
          LinkUrlSuccess: 'https://liliadubita.md/multumim?order=' + testOrderId,
          LinkUrlCancel: 'https://liliadubita.md/plata?cancel=1&order=' + testOrderId,
          ExternalDate: formatDate(new Date()),
          ExpiryDate: formatDate(new Date(Date.now() + 2 * 60 * 60 * 1000)),
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
          Services: [
            {
              Name: 'RELAȚIA 360',
              Description: 'Curs practic de comunicare în relații',
              Amount: productTotalAmount, // Must equal sum of Products[].TotalAmount
              Products: [product],
            },
          ],
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

