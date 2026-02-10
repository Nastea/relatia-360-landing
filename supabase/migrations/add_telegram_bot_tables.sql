-- Extend orders table with Telegram-binding columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create telegram_users table
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

-- Create telegram_access table
CREATE TABLE IF NOT EXISTS public.telegram_access (
  telegram_user_id BIGINT NOT NULL REFERENCES public.telegram_users(telegram_user_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  access_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ NULL,
  source_token_hash TEXT NULL,
  PRIMARY KEY (telegram_user_id, product_id)
);

-- Create telegram_token_attempts table
CREATE TABLE IF NOT EXISTS public.telegram_token_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  reason TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_telegram_attempts_user_time
  ON public.telegram_token_attempts (telegram_user_id, attempted_at DESC);


