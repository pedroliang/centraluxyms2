-- Adicionando coluna opcional cliente
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS cliente TEXT;
