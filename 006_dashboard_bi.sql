-- Función RPC para el Dashboard de Business Intelligence
-- Combina KPIs financieros e Insights operativos en un solo query de alto rendimiento
CREATE OR REPLACE FUNCTION public.get_dashboard_bi()
RETURNS json AS $$
DECLARE
  v_ventas_hoy NUMERIC;
  v_tickets_hoy INT;
  v_margen_hoy NUMERIC;
  v_alertas JSON;
  v_estancados JSON;
BEGIN
  -- 1. KPIs Financieros (Ventas de Hoy)
  -- NOTA: Se asume que total_bs y tasa_dia existen en la tabla ventas. 
  -- Se calcula el USD dinámicamente. 
  -- Contamos distinct fecha_venta como proxy de 'Tickets'
  SELECT 
    COALESCE(SUM(total_bs / NULLIF(tasa_dia, 0)), 0),
    COUNT(DISTINCT fecha_venta)
  INTO v_ventas_hoy, v_tickets_hoy
  FROM ventas
  WHERE fecha_venta::date = CURRENT_DATE 
    AND tenant_id = auth.uid();

  -- Margen estimado del 30%
  v_margen_hoy := v_ventas_hoy * 0.30;

  -- 2. Insights Operativos: Alertas de Reposición
  SELECT json_agg(json_build_object('producto', nombre, 'stock', stock))
  INTO v_alertas
  FROM productos
  WHERE stock < 10 
    AND tenant_id = auth.uid();

  -- 3. Insights Operativos: Dinero Estancado
  -- Stock alto (> 50) y sin ventas en los últimos 7 días
  SELECT json_agg(json_build_object('producto', nombre, 'stock', stock))
  INTO v_estancados
  FROM productos p
  WHERE stock > 50 
    AND tenant_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM ventas v 
      WHERE v.producto_id = p.id 
        AND v.fecha_venta::date >= CURRENT_DATE - INTERVAL '7 days'
        AND v.tenant_id = auth.uid()
    );

  -- 4. Consolidar el resultado JSON
  RETURN json_build_object(
    'kpis', json_build_object(
      'ventas_hoy', ROUND(v_ventas_hoy, 2), 
      'tickets', v_tickets_hoy, 
      'margen', ROUND(v_margen_hoy, 2)
    ),
    'alertas_reposicion', COALESCE(v_alertas, '[]'::json),
    'dinero_estancado', COALESCE(v_estancados, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Dar permisos de ejecución al rol autenticado
GRANT EXECUTE ON FUNCTION public.get_dashboard_bi() TO authenticated;
