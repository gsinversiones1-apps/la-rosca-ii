-- ==============================================================================
-- Migración 013: Reversión de Bypasses Anónimos
-- ==============================================================================

-- Revocar permisos de ejecución al rol anónimo para proteger el Dashboard BI
REVOKE EXECUTE ON FUNCTION public.get_dashboard_bi() FROM anon;

-- Nota: El trigger de stock (procesar_venta_stock) no necesita reinstaurar la verificación 
-- manual de auth.uid() = tenant_id, ya que ahora la seguridad está completamente 
-- delegada a las políticas RLS de la tabla 'productos' y 'ventas', evitando fallos 
-- de tipo UUID/Texto y permitiendo esquemas compartidos.
