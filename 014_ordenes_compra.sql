-- 014_ordenes_compra.sql
-- Migración para añadir soporte de órdenes de compra, teléfono y email de proveedor en productos.

-- 1. Añadir columnas de contacto del proveedor a la tabla productos si no existen
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS telefono_proveedor TEXT,
ADD COLUMN IF NOT EXISTS email_proveedor TEXT;

-- 2. Crear tabla de ordenes_compra
CREATE TABLE IF NOT EXISTS public.ordenes_compra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id INTEGER REFERENCES public.productos(id) ON DELETE SET NULL,
    descripcion_producto TEXT NOT NULL,
    cantidad_a_pedir BIGINT NOT NULL,
    estado TEXT DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Configurar Seguridad (RLS) para ordenes_compra
ALTER TABLE public.ordenes_compra ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden ver ordenes_compra" ON public.ordenes_compra;
CREATE POLICY "Todos pueden ver ordenes_compra" ON public.ordenes_compra
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos pueden insertar ordenes_compra" ON public.ordenes_compra;
CREATE POLICY "Todos pueden insertar ordenes_compra" ON public.ordenes_compra
    FOR INSERT WITH CHECK (true);

-- 4. Modificar get_dashboard_bi para retornar id, telefono y email en alertas de reposicion
-- Esto asume que existe la función y la sobreescribe con los nuevos campos
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
    COALESCE(SUM(total_bs / NULLIF(tasa_dia, 0)), 0),
    COUNT(DISTINCT fecha_venta)
  INTO v_ventas_hoy, v_tickets_hoy
  FROM ventas
  WHERE fecha_venta::date = CURRENT_DATE;

  -- Margen estimado del 30%
  v_margen_hoy := v_ventas_hoy * 0.30;

  -- 2. Insights Operativos: Alertas de Reposición
  -- AÑADIDO: id, telefono_proveedor, email_proveedor, stock_minimo
  SELECT json_agg(
    json_build_object(
      'id', id,
      'producto', nombre, 
      'stock', stock,
      'stock_minimo', stock_minimo,
      'telefono_proveedor', telefono_proveedor,
      'email_proveedor', email_proveedor
    )
  )
  INTO v_alertas
  FROM productos
  WHERE stock <= COALESCE(stock_minimo, 10);

  -- 3. Insights Operativos: Dinero Estancado
  SELECT json_agg(json_build_object('id', id, 'producto', nombre, 'stock', stock))
  INTO v_estancados
  FROM productos p
  WHERE stock > 50 
    AND NOT EXISTS (
      SELECT 1 FROM ventas v 
      WHERE v.producto_id = p.id 
        AND v.fecha_venta::date >= CURRENT_DATE - INTERVAL '7 days'
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

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.get_dashboard_bi() TO anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_bi() TO authenticated;
