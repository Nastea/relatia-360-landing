# Paynet Integration Setup

## Environment Variables

Add these to your Vercel project settings and local `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paynet Configuration
PAYNET_ENV=test
PAYNET_API_HOST_TEST=https://api-merchant.test.paynet.md
PAYNET_PORTAL_HOST_TEST=https://test.paynet.md
PAYNET_USERNAME=657846
PAYNET_PASSWORD=Qckfa3j3
PAYNET_MERCHANT_CODE=982657
PAYNET_SALE_AREA_CODE=https_liliadubita_md
PAYNET_NOTIFY_SECRET_KEY_TEST=A7E76D12-2690-4BBE-A5F2-1F26FDEB2738
PAYNET_CALLBACK_URL=https://liliadubita.md/api/paynet/callback

# For LIVE mode (when PAYNET_ENV=live):
# PAYNET_API_HOST_LIVE=...
# PAYNET_PORTAL_HOST_LIVE=...
# PAYNET_NOTIFY_SECRET_KEY_LIVE=...
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

