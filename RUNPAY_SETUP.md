# RunPay Checkout Integration - Setup Guide

This project implements a **mock RunPay checkout flow** that works end-to-end for testing. When RunPay credentials are available, switch to live mode by setting environment variables.

## 🚀 Quick Start (Mock Mode)

### 1. Supabase Setup

Run the migration to create the `orders` table:

```sql
-- File: supabase/migrations/create_orders_table.sql
-- Execute this in your Supabase SQL editor or via migration tool
```

Or manually create the table using the SQL in `supabase/migrations/create_orders_table.sql`.

### 2. Environment Variables (Vercel)

Set these in your Vercel project settings:

```bash
# Required
SITE_URL=https://liliadubita.md
TELEGRAM_BOT_USERNAME=YourBotName  # Without @ symbol

# Optional (defaults to mock mode)
RUNPAY_MODE=mock  # Set to "live" when RunPay credentials are ready

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test the Flow

1. Go to `/plata`
2. Accept terms and click "Plătește"
3. You'll be redirected to `/mock/runpay?order=<uuid>`
4. Click "Simulează plată reușită"
5. You'll be redirected to `/multumim?order=<uuid>`
6. The page will poll for payment status
7. Once "paid", you'll see a Telegram button with deep link

## 📋 Flow Overview

```
User → /plata → POST /api/checkout/create
  ↓
Order created in Supabase (status: pending)
  ↓
Redirect to payment URL:
  - Mock: /mock/runpay?order=<uuid>
  - Live: RunPay checkout page
  ↓
Payment confirmation:
  - Mock: Button calls POST /api/runpay/webhook
  - Live: RunPay webhook calls POST /api/runpay/webhook
  ↓
Order updated in Supabase (status: paid)
  ↓
User redirected to /multumim?order=<uuid>
  ↓
Page polls GET /api/orders/status
  ↓
When paid: Fetch access_token via GET /api/orders/access
  ↓
Show Telegram deep link: https://t.me/BotName?start=access_<token>
```

## 🔄 Switching to Live RunPay Mode

When you receive RunPay credentials:

1. **Set environment variables in Vercel:**
   ```bash
   RUNPAY_MODE=live
   RUNPAY_BASE_URL=https://api.runpay.md  # Example
   RUNPAY_BEARER_TOKEN=your_bearer_token
   RUNPAY_MERCHANT_ID=your_merchant_id
   RUNPAY_WEBHOOK_SECRET=your_webhook_secret  # If provided
   ```

2. **Update `/api/checkout/create/route.ts`:**
   - Uncomment and implement the TODO section for RunPay API call
   - The structure is already documented in the code comments

3. **Update `/api/runpay/webhook/route.ts`:**
   - Add signature verification if `RUNPAY_WEBHOOK_SECRET` is provided
   - Adapt webhook payload parsing to match RunPay's actual structure

## 📁 File Structure

```
app/
  api/
    checkout/
      create/route.ts          # Creates order + returns payment URL
    runpay/
      webhook/route.ts          # Handles payment webhooks (mock + live)
    orders/
      status/route.ts           # Returns order status (for polling)
      access/route.ts           # Returns access_token if paid
    telegram/
      verify/route.ts           # Verifies access_token for bot
    config/
      route.ts                  # Returns public config (bot username)
  mock/
    runpay/page.tsx             # Mock payment page
  plata/
    page.tsx                     # Payment page (updated to use new API)
  multumim/
    page.tsx                     # Thank you page (with polling + Telegram link)

supabase/
  migrations/
    create_orders_table.sql     # Orders table schema
```

## 🔐 Security Notes

- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to client-side
- **Never expose** `RUNPAY_BEARER_TOKEN` to client-side
- `access_token` is only revealed after payment is confirmed
- Webhook signature verification should be added when RunPay provides secret

## 🧪 Testing

### Mock Flow Test:
1. Visit `/plata`
2. Complete mock payment flow
3. Verify order appears in Supabase with `status='paid'`
4. Verify Telegram link contains correct `access_token`

### API Endpoints Test:
```bash
# Create order
curl -X POST https://liliadubita.md/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"relatia360"}'

# Check status
curl https://liliadubita.md/api/orders/status?order=<uuid>

# Get access token (only if paid)
curl https://liliadubita.md/api/orders/access?order=<uuid>

# Verify token (for Telegram bot)
curl https://liliadubita.md/api/telegram/verify?token=<access_token>
```

## 📝 TODO for Live RunPay Integration

1. **In `/api/checkout/create/route.ts`:**
   - Implement RunPay invoice API call (see TODO comment)
   - Store `paymentId` and `url` in order record

2. **In `/api/runpay/webhook/route.ts`:**
   - Add webhook signature verification
   - Parse RunPay webhook payload structure
   - Extract `order_id` from webhook (may be in `invoice.params.order_id`)

3. **Environment Variables:**
   - Set `RUNPAY_MODE=live`
   - Add all RunPay credentials

4. **Testing:**
   - Test with real RunPay test mode (if available)
   - Verify webhook receives correct payload
   - Test end-to-end flow

## 🐛 Troubleshooting

**Order not updating to "paid":**
- Check webhook logs in Vercel
- Verify webhook is receiving correct `orderId`
- Check Supabase for order record

**Telegram link not working:**
- Verify `TELEGRAM_BOT_USERNAME` is set correctly (no @ symbol)
- Check `/api/config` returns correct bot username
- Verify `access_token` is being fetched correctly

**Polling not stopping:**
- Check browser console for errors
- Verify `/api/orders/status` returns correct status
- Check network tab for API responses

