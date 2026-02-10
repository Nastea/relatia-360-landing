-- Drop order_id column from orders table
-- The table should only use id (UUID) as the primary key

ALTER TABLE public.orders DROP COLUMN IF EXISTS order_id;

