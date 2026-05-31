-- ==============================================================================
-- 017 - ACTUALIZACIÓN DE DASHBOARD BI PARA MULTI-TENANT
-- Este script actualiza la función del dashboard para leer las nuevas columnas.
-- ==============================================================================

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
  SELECT 
    COALESCE(SUM(total_local_currency / NULLIF(exchange_rate, 0)), 0),
    COUNT(DISTINCT created_at)
  INTO v_ventas_hoy, v_tickets_hoy
  FROM ventas
  WHERE created_at::date = CURRENT_DATE;

  -- Margen estimado del 30%
  v_margen_hoy := v_ventas_hoy * 0.30;

  -- 2. Insights Operativos: Alertas de Reposición
  SELECT json_agg(
    json_build_object(
      'id', id,
      'producto', name, 
      'stock', stock_quantity,
      'stock_minimo', min_stock_level,
      'telefono_proveedor', telefono_proveedor,
      'email_proveedor', email_proveedor
    )
  )
  INTO v_alertas
  FROM productos
  WHERE stock_quantity <= COALESCE(min_stock_level, 10);

  -- 3. Insights Operativos: Dinero Estancado
  SELECT json_agg(json_build_object('id', id, 'producto', name, 'stock', stock_quantity))
  INTO v_estancados
  FROM productos p
  WHERE stock_quantity > 50 
    AND NOT EXISTS (
      SELECT 1 FROM ventas v 
      WHERE v.product_id = p.id 
        AND v.created_at::date >= CURRENT_DATE - INTERVAL '7 days'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
