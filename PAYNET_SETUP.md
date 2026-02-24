# Paynet Integration Setup

## Mapping Paynet → env vars

- **Partner ID** (din Paynet) = `PAYNET_MERCHANT_CODE`
- **User ID** (din Paynet) = `PAYNET_USERNAME`
- Parola API = `PAYNET_PASSWORD` — **doar în env (Vercel / .env.local), niciodată în repo**

## Environment Variables

Adaugă în Vercel (Settings → Environment Variables) și în `.env.local` pentru local:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paynet — TEST
PAYNET_ENV=test
PAYNET_API_HOST_TEST=https://api-merchant.test.paynet.md
PAYNET_PORTAL_HOST_TEST=https://test.paynet.md
PAYNET_USERNAME=778664
PAYNET_PASSWORD=<parola primită de la Paynet — doar în env>
PAYNET_MERCHANT_CODE=982657
PAYNET_SALE_AREA_CODE=https_liliadubita_md
PAYNET_NOTIFY_SECRET_KEY_TEST=<cheie de la Paynet pentru test>
PAYNET_CALLBACK_URL=https://<domeniul-tau>/api/paynet/callback

# Pentru LIVE (după ce integrarea e validată):
# PAYNET_ENV=live
# PAYNET_API_HOST_LIVE=https://api-merchant.paynet.md
# PAYNET_PORTAL_HOST_LIVE=https://paynet.md
# PAYNET_NOTIFY_SECRET_KEY_LIVE=<cheie LIVE de la Paynet>
# (PAYNET_USERNAME, PAYNET_PASSWORD, PAYNET_MERCHANT_CODE, PAYNET_CALLBACK_URL rămân aceleași)
```

## Database Migration

Run the SQL migration in Supabase:

```sql
-- File: supabase/migrations/add_paynet_columns.sql
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice BIGINT UNIQUE NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
ADD COLUMN IF NOT EXISTS paynet_payment_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_orders_invoice ON public.orders(invoice);
```

## Flow

1. User clicks "Plătește" on `/plata`
2. Frontend POSTs to `/api/paynet/create` with `{ productId, amount, currency }`
3. Server:
   - Creates order in Supabase with `invoice` (timestamp)
   - Authenticates with Paynet API
   - Creates payment via Paynet API
   - Returns `payment_url` to Paynet hosted page
4. User completes payment on Paynet
5. Paynet POSTs callback to `/api/paynet/callback` with signed payload
6. Server verifies signature and updates order to `paid`
7. User redirected to `/multumim?order=...`

## Signature Verification

The callback verifies the `Hash` header using:
- PreparedString: `EventDate + Eventid + EventType + Payment.Amount + Payment.Customer + Payment.ExternalID + Payment.ID + Payment.Merchant + Payment.StatusDate`
- Hash: `Base64(MD5(PreparedString + PAYNET_SECRET_KEY))`

---

## Trecerea în LIVE

După ce integrarea în mediul de **test** funcționează corect:

1. **Execută o tranzacție de test** cu card de test: `1111 1111 1111 1111`, expirare `12/35`, CVV `123`.
2. Dacă totul merge corect, **scrie în chat-ul cu Paynet**: „În mediul de test tot este testat, suntem gata să trecem pe LIVE.”
3. După confirmarea Paynet, în Vercel schimbă:
   - `PAYNET_ENV=live`
   - Adaugă `PAYNET_API_HOST_LIVE`, `PAYNET_PORTAL_HOST_LIVE`, `PAYNET_NOTIFY_SECRET_KEY_LIVE` (valorile LIVE primite de la Paynet).
4. Redeploy și testează din nou o plată (în LIVE se folosesc carduri reale).

