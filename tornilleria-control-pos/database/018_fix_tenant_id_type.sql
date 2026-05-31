-- ==============================================================================
-- FIX PREVIO: LIMPIAR POLÍTICAS VIEJAS Y CONVERTIR A UUID (V3)
-- Ejecutar esto antes del Script 018
-- ==============================================================================

DO $$
DECLARE
    default_tenant_id UUID;
    pol RECORD;
BEGIN
    -- 1. Eliminar temporalmente todas las políticas viejas que dependan de la columna (El Script 018 las recreará correctamente)
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('productos', 'clientes', 'ventas') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;

    -- 2. Obtener el UUID real
    SELECT id INTO default_tenant_id FROM tenants WHERE business_name = 'La Rosca II' LIMIT 1;
    
    -- 3. Para PRODUCTOS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='tenant_id' AND data_type IN ('text', 'character varying')) THEN
        EXECUTE 'ALTER TABLE productos ALTER COLUMN tenant_id DROP DEFAULT';
        EXECUTE 'UPDATE productos SET tenant_id = $1 WHERE length(tenant_id) != 36 OR tenant_id IS NULL' USING default_tenant_id;
        EXECUTE 'ALTER TABLE productos ALTER COLUMN tenant_id TYPE UUID USING tenant_id::uuid';
    END IF;

    -- 4. Para CLIENTES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='tenant_id' AND data_type IN ('text', 'character varying')) THEN
        EXECUTE 'ALTER TABLE clientes ALTER COLUMN tenant_id DROP DEFAULT';
        EXECUTE 'UPDATE clientes SET tenant_id = $1 WHERE length(tenant_id) != 36 OR tenant_id IS NULL' USING default_tenant_id;
        EXECUTE 'ALTER TABLE clientes ALTER COLUMN tenant_id TYPE UUID USING tenant_id::uuid';
    END IF;

    -- 5. Para VENTAS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='tenant_id' AND data_type IN ('text', 'character varying')) THEN
        EXECUTE 'ALTER TABLE ventas ALTER COLUMN tenant_id DROP DEFAULT';
        EXECUTE 'UPDATE ventas SET tenant_id = $1 WHERE length(tenant_id) != 36 OR tenant_id IS NULL' USING default_tenant_id;
        EXECUTE 'ALTER TABLE ventas ALTER COLUMN tenant_id TYPE UUID USING tenant_id::uuid';
    END IF;
END $$;
