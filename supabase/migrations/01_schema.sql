-- Criação das tabelas do YMS na Centralux

-- 1. Tabela processes
CREATE TABLE IF NOT EXISTS public.processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('loading', 'unloading')),
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS (Row Level Security) e criar policy aberta (em dev)
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.processes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.processes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.processes FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.processes FOR DELETE USING (true);

-- 2. Tabela products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    qty_unit INTEGER DEFAULT 0,
    qty_boxes INTEGER DEFAULT 0,
    qty_per_box INTEGER DEFAULT 0,
    cubagem JSONB,
    lote TEXT,
    is_manual BOOLEAN DEFAULT false,
    is_overridden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.products FOR DELETE USING (true);
