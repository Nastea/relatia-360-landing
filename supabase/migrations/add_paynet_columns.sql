-- Add invoice and paynet_payment_id columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice BIGINT UNIQUE NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
ADD COLUMN IF NOT EXISTS paynet_payment_id BIGINT;

-- Create index on invoice for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON public.orders(invoice);

