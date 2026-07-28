-- Date client colectate la înregistrare (nume, prenume, email, telefon)
-- trimise către Paynet și păstrate pentru lista de participanți.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_last_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;
