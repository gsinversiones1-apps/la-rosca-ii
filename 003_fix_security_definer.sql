-- 1. Eliminamos la vista insegura
DROP VIEW IF EXISTS public.v_inventario_alertas;

-- 2. La recreamos con SECURITY INVOKER (La forma correcta y segura)
-- Al usar 'security_invoker = true', la vista hereda automáticamente 
-- las políticas RLS de la tabla 'productos'.
CREATE OR REPLACE VIEW public.v_inventario_alertas 
WITH (security_invoker = true) AS
SELECT 
    id,
    nombre,
    codigo_skv,
    stock,
    precio_usd,
    area,
    tenant_id
FROM productos
WHERE stock <= 10; -- Solo muestra productos que necesitan reposición

-- 3. Asignamos permisos correctos para que el frontend pueda leerla
GRANT SELECT ON public.v_inventario_alertas TO authenticated;
GRANT SELECT ON public.v_inventario_alertas TO anon;

COMMENT ON VIEW public.v_inventario_alertas IS 'Vista segura para alertas de stock bajo que respeta el aislamiento por Tenant.';
