-- ==============================================================================
-- 018 - AUTENTICACIÓN MULTI-TENANT Y AISLAMIENTO RLS ESTRICTO
-- Este script vincula a los usuarios con un negocio (Tenant) y blinda la BDD.
-- ==============================================================================

-- 1. Añadir tenant_id a la tabla de perfiles
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 2. Asignar todos los perfiles existentes al Tenant Principal ("La Rosca II") para evitar bloqueos
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    SELECT id INTO default_tenant_id FROM tenants WHERE business_name = 'La Rosca II' LIMIT 1;
    
    IF default_tenant_id IS NOT NULL THEN
        UPDATE public.perfiles SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
        
        -- Opcional: Hacer la columna NOT NULL a futuro, pero lo dejamos NULLable
        -- por si el SuperAdmin no pertenece a ningún tenant.
    END IF;
END $$;

-- 3. Actualizar el Trigger de Creación de Perfil para Usuarios Nuevos
-- Asignaremos por defecto al tenant principal si no se especifica.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Buscar tenant por defecto
  SELECT id INTO v_tenant_id FROM public.tenants WHERE business_name = 'La Rosca II' LIMIT 1;

  -- El primer usuario registrado será 'admin', los demás 'vendedor'
  IF NOT EXISTS (SELECT 1 FROM public.perfiles) THEN
    INSERT INTO public.perfiles (user_id, rol, tenant_id) VALUES (NEW.id, 'admin', v_tenant_id);
  ELSE
    INSERT INTO public.perfiles (user_id, rol, tenant_id) VALUES (NEW.id, 'vendedor', v_tenant_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función Trigger para INYECTAR AUTOMÁTICAMENTE el tenant_id en cualquier INSERT
CREATE OR REPLACE FUNCTION public.set_tenant_id_from_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Solo inyectar si la aplicación no lo pasó explícitamente y el usuario está logueado
  IF NEW.tenant_id IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT tenant_id INTO v_tenant_id FROM public.perfiles WHERE user_id = auth.uid() LIMIT 1;
    IF v_tenant_id IS NOT NULL THEN
      NEW.tenant_id := v_tenant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asignar el trigger automático a las tablas principales
DROP TRIGGER IF EXISTS trg_set_tenant_productos ON public.productos;
CREATE TRIGGER trg_set_tenant_productos
  BEFORE INSERT ON public.productos
  FOR EACH ROW EXECUTE PROCEDURE public.set_tenant_id_from_profile();

DROP TRIGGER IF EXISTS trg_set_tenant_clientes ON public.clientes;
CREATE TRIGGER trg_set_tenant_clientes
  BEFORE INSERT ON public.clientes
  FOR EACH ROW EXECUTE PROCEDURE public.set_tenant_id_from_profile();

DROP TRIGGER IF EXISTS trg_set_tenant_ventas ON public.ventas;
CREATE TRIGGER trg_set_tenant_ventas
  BEFORE INSERT ON public.ventas
  FOR EACH ROW EXECUTE PROCEDURE public.set_tenant_id_from_profile();

-- 5. REEMPLAZAR POLÍTICAS RLS TEMPORALES POR POLÍTICAS ESTRICTAS (TENANT ISOLATION)
-- Notas: Solo puedes interactuar con filas cuyo tenant_id sea igual al tuyo.

-- PRODUCTOS
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Productos" ON public.productos;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Productos" ON public.productos 
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid())); 

DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Escritura de Productos" ON public.productos;
CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Productos" ON public.productos 
FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid()));    

-- CLIENTES
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Clientes" ON public.clientes;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Clientes" ON public.clientes 
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Escritura de Clientes" ON public.clientes;
CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Clientes" ON public.clientes 
FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid()));

-- VENTAS
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Ventas" ON public.ventas;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Ventas" ON public.ventas 
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Escritura de Ventas" ON public.ventas;
CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Ventas" ON public.ventas 
FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid()));

-- DASHBOARD BI: Reemplazar función para que filtre también por Tenant ID!
-- (Esto evita que La Rosca II vea el dashboard de otra ferretería).
CREATE OR REPLACE FUNCTION public.get_dashboard_bi()
RETURNS json AS $$
DECLARE
  v_ventas_hoy NUMERIC;
  v_tickets_hoy INT;
  v_margen_hoy NUMERIC;
  v_alertas JSON;
  v_estancados JSON;
  v_tenant_id UUID;
BEGIN
  -- Obtener el tenant_id del usuario que ejecuta el dashboard
  SELECT tenant_id INTO v_tenant_id FROM public.perfiles WHERE user_id = auth.uid() LIMIT 1;

  IF v_tenant_id IS NULL THEN
     RAISE EXCEPTION 'Usuario no tiene un tenant_id asignado';
  END IF;

  -- 1. Ventas de Hoy
  SELECT 
    COALESCE(SUM(total_local_currency / NULLIF(exchange_rate, 0)), 0),
    COUNT(DISTINCT created_at)
  INTO v_ventas_hoy, v_tickets_hoy
  FROM ventas
  WHERE created_at::date = CURRENT_DATE AND tenant_id = v_tenant_id;

  v_margen_hoy := v_ventas_hoy * 0.30;

  -- 2. Alertas de Reposición
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
  WHERE stock_quantity <= COALESCE(min_stock_level, 10) AND tenant_id = v_tenant_id;

  -- 3. Dinero Estancado
  SELECT json_agg(json_build_object('id', id, 'producto', name, 'stock', stock_quantity))
  INTO v_estancados
  FROM productos p
  WHERE stock_quantity > 50 AND tenant_id = v_tenant_id
    AND NOT EXISTS (
      SELECT 1 FROM ventas v 
      WHERE v.product_id = p.id 
        AND v.created_at::date >= CURRENT_DATE - INTERVAL '7 days'
        AND v.tenant_id = v_tenant_id
    );

  RETURN json_build_object(
    'kpis', json_build_object('ventas_hoy', ROUND(v_ventas_hoy, 2), 'tickets', v_tickets_hoy, 'margen', ROUND(v_margen_hoy, 2)),
    'alertas_reposicion', COALESCE(v_alertas, '[]'::json),
    'dinero_estancado', COALESCE(v_estancados, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
