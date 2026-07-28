-- =============================================================================
--  PSIHOLOGIA BANILOR / RELAȚIA 360 — schema completă (idempotentă)
--  Rulează tot acest bloc în Supabase → SQL Editor → New query → Run,
--  pe un proiect NOU, ca să recreezi tabelele necesare.
-- =============================================================================

-- 1) Tabela orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MDL',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  runpay_payment_id TEXT NULL,
  runpay_payload JSONB NULL,
  access_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ NULL,
  access_used_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_access_token ON public.orders(access_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 2) Coloane Paynet
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS invoice BIGINT UNIQUE NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  ADD COLUMN IF NOT EXISTS paynet_payment_id BIGINT,
  ADD COLUMN IF NOT EXISTS paynet_signature TEXT,
  ADD COLUMN IF NOT EXISTS paynet_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paynet_payload JSONB;

CREATE INDEX IF NOT EXISTS idx_orders_invoice ON public.orders(invoice);

-- 2b) Date client (nume, prenume, email, telefon)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_last_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 3) Coloane Telegram pe orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4) Tabele Telegram
CREATE TABLE IF NOT EXISTS public.telegram_users (
  telegram_user_id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  state TEXT NOT NULL DEFAULT 'NEW', -- NEW | AWAITING_TOKEN | ACTIVE | BLOCKED
  blocked_until TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.telegram_access (
  telegram_user_id BIGINT NOT NULL REFERENCES public.telegram_users(telegram_user_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  access_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ NULL,
  source_token_hash TEXT NULL,
  PRIMARY KEY (telegram_user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.telegram_token_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  reason TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_telegram_attempts_user_time
  ON public.telegram_token_attempts (telegram_user_id, attempted_at DESC);
