-- ==============================================================================
-- 021 - MOTOR DE MARCA BLANCA (WHITE-LABELING)
-- Agrega soporte de colores personalizados por cada negocio (Tenant)
-- ==============================================================================

-- 1. Agregamos las columnas de colores (con valores por defecto de La Rosca II)
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS theme_primary TEXT DEFAULT '#FF5A00';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS theme_secondary TEXT DEFAULT '#0A0A0A';

-- 2. Asignamos explícitamente los colores a La Rosca II (por si acaso el default no aplicó al registro existente)
UPDATE public.tenants 
SET theme_primary = '#FF5A00',
    theme_secondary = '#0A0A0A'
WHERE business_name = 'La Rosca II';

-- 3. Le damos su propia identidad a Karelis (Ferretería Industrial C.A.)
-- Color primario: Amarillo Premium (#FFB300)
-- Color secundario (Fondo oscuro o Navy alternativo): Azul Marino Oscuro (#06142e)
UPDATE public.tenants 
SET theme_primary = '#FFB300',
    theme_secondary = '#06142e'
WHERE business_name = 'Ferretería Industrial C.A.';
