# PAYNET_SUPPORT_SAMPLE

## Request Details (TEST Environment)

**HTTP Method:** `POST`

**Full URL:** `https://api-merchant.test.paynet.md/api/Payments/Send`

**Request Headers:**
```
Authorization: Bearer Bear***
Content-Type: application/json
```

**Request Body (PAYNET_REG_PAYLOAD):**
```json
{
  "Invoice": 1735689600,
  "MerchantCode": "982657",
  "LinkUrlSuccess": "https://liliadubita.md/multumim?order=550e8400-e29b-41d4-a716-446655440000",
  "LinkUrlCancel": "https://liliadubita.md/plata?cancel=1&order=550e8400-e29b-41d4-a716-446655440000",
  "Signature": null,
  "SignVersion": "v01",
  "Customer": {
    "Code": "no-reply@liliadubita.md",
    "Name": "Customer",
    "NameFirst": "Customer",
    "NameLast": "Customer",
    "email": "no-reply@liliadubita.md",
    "Country": "Moldova",
    "City": "Chisinau",
    "Address": "Online",
    "PhoneNumber": "79306530"
  },
  "Payer": null,
  "Currency": 498,
  "ExternalDate": "2024-12-31T12:00:00",
  "ExpiryDate": "2024-12-31T14:00:00",
  "Services": [
    {
      "Name": "RELAȚIA 360",
      "Description": "Curs practic de comunicare în relații",
      "Amount": 99000,
      "Products": [
        {
          "GroupName": null,
          "QualitiesConcat": null,
          "LineNo": 1,
          "GroupId": null,
          "Code": "relatia360",
          "Barcode": 3601,
          "Name": "RELAȚIA 360 – De la conflict la conectare",
          "Description": "Acces online",
          "UnitPrice": 99000,
          "UnitProduct": null,
          "Quantity": 100,
          "Amount": null,
          "Dimensions": null,
          "Qualities": null,
          "TotalAmount": 99000
        }
      ]
    }
  ],
  "MoneyType": null
}
```

**Response Status:** `400` (or `200` if successful)

**Response Body (PAYNET_PAYMENTS_BODY):**
```
Code: 14
Message: INVALID_PARAMETER
```

---

## Notes for Paynet Support

1. **Signature field:** Currently sent as `null` (not calculated). Per Reg.json example, should we calculate Signature or is null acceptable in TEST mode?

2. **Amount values:** We're sending amounts in minor units (99000 = 990.00 MDL). Quantity is 100 (representing 1.00 unit). TotalAmount = UnitPrice = 99000. Service Amount = Product TotalAmount (both 99000).

3. **Currency:** 498 (MDL)

4. **SaleAreaCode:** Not included in this payload (attempt C/D). We also test with SaleAreaCode included (attempts E/F).

5. **Structure:** This matches the Reg.json structure (with Signature, SignVersion, MoneyType, Payer=null, NO Lang field).

6. **Invoice field:** Currently using timestamp `Math.floor(Date.now() / 1000)` which generates ~10-digit numbers. Reg.json example shows smaller integers (214454). This might be the issue - should Invoice be a smaller integer rather than a Unix timestamp?

## Potential Issues (Based on Reg.json Comparison)

- **Invoice format:** Reg.json uses small integers (214454), we use Unix timestamps (~1735689600). This could be the INVALID_PARAMETER issue.
- **Service Amount validation:** In Reg.json, Service Amount equals sum of all Products TotalAmount. Our single product matches this, but worth verifying.

---

## Alternative Attempts Being Tested

We also test these variations:
- **Attempt A/B:** PHP SDK structure (NO Signature/SignVersion/MoneyType, WITH Lang, Payer=Customer object)
- **Attempt E/F:** Same as C/D but WITH SaleAreaCode field

All return Code 14 INVALID_PARAMETER.

Please advise which field(s) are invalid per your API specification.

---

## Email-Ready Version (Copy-Paste)

**Subject:** Code 14 INVALID_PARAMETER - Request Sample (TEST Environment)

Hello Paynet Support,

We are receiving Code 14 INVALID_PARAMETER when calling the Payments/Send endpoint in TEST mode. Below is the exact request we are sending:

**Endpoint:** POST https://api-merchant.test.paynet.md/api/Payments/Send

**Headers:**
- Authorization: Bearer Bear*** (masked)
- Content-Type: application/json

**Request Body:**
```json
{
  "Invoice": 1735689600,
  "MerchantCode": "982657",
  "LinkUrlSuccess": "https://liliadubita.md/multumim?order=550e8400-e29b-41d4-a716-446655440000",
  "LinkUrlCancel": "https://liliadubita.md/plata?cancel=1&order=550e8400-e29b-41d4-a716-446655440000",
  "Signature": null,
  "SignVersion": "v01",
  "Customer": {
    "Code": "no-reply@liliadubita.md",
    "Name": "Customer",
    "NameFirst": "Customer",
    "NameLast": "Customer",
    "email": "no-reply@liliadubita.md",
    "Country": "Moldova",
    "City": "Chisinau",
    "Address": "Online",
    "PhoneNumber": "79306530"
  },
  "Payer": null,
  "Currency": 498,
  "ExternalDate": "2024-12-31T12:00:00",
  "ExpiryDate": "2024-12-31T14:00:00",
  "Services": [
    {
      "Name": "RELAȚIA 360",
      "Description": "Curs practic de comunicare în relații",
      "Amount": 99000,
      "Products": [
        {
          "GroupName": null,
          "QualitiesConcat": null,
          "LineNo": 1,
          "GroupId": null,
          "Code": "relatia360",
          "Barcode": 3601,
          "Name": "RELAȚIA 360 – De la conflict la conectare",
          "Description": "Acces online",
          "UnitPrice": 99000,
          "UnitProduct": null,
          "Quantity": 100,
          "Amount": null,
          "Dimensions": null,
          "Qualities": null,
          "TotalAmount": 99000
        }
      ]
    }
  ],
  "MoneyType": null
}
```

**Response:** Code 14 INVALID_PARAMETER

**Questions:**
1. Is Signature: null acceptable in TEST mode, or must it be calculated?
2. Are the amount values correct (99000 = 990.00 MDL in minor units)?
3. **Invoice field:** We're using Unix timestamp (1735689600). Reg.json example shows smaller integers (214454). Should Invoice be a smaller integer format?
4. Which specific field(s) are causing the INVALID_PARAMETER error?

We have also tested variations (with/without SaleAreaCode, PHP SDK structure vs Reg.json structure) - all return the same error.

Thank you for your assistance.

