-- Adicionando campos de origem e destino na tabela existente de processos

ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'Indefinida';
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS destination TEXT DEFAULT 'Indefinida';
