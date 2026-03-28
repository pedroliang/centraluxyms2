-- Alterar colunas de quantidade para NUMERIC para suportar decimais
ALTER TABLE public.products 
ALTER COLUMN qty_unit TYPE NUMERIC,
ALTER COLUMN qty_boxes TYPE NUMERIC,
ALTER COLUMN qty_per_box TYPE NUMERIC,
ALTER COLUMN qty_unit_sp TYPE NUMERIC,
ALTER COLUMN qty_unit_df TYPE NUMERIC,
ALTER COLUMN qty_boxes_sp TYPE NUMERIC,
ALTER COLUMN qty_boxes_df TYPE NUMERIC;
