-- ==============================================================================
-- 016 - MIGRACIÓN A VERDADERA ARQUITECTURA MULTI-TENANT (SAAS)
-- Este script introduce el concepto de "Tenants" (Clientes SaaS) para aislar datos.
-- IMPORTANTE: Ejecutar en el SQL Editor de Supabase DESPUÉS del script 015.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREACIÓN DE LA TABLA MADRE: TENANTS (Tus Clientes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL, -- ej. "La Rosca II", "Supermercado Z"
    business_type TEXT,          -- ej. "Hardware Store", "Grocery", "Cosmetics"
    contact_email TEXT,
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en Tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. INSERCIÓN DEL TENANT PRINCIPAL (LA ROSCA II)
-- ------------------------------------------------------------------------------
-- Insertamos el primer inquilino y guardamos su UUID para asociarlo a los datos viejos
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Comprobar si ya existe para evitar duplicados en re-ejecuciones
    SELECT id INTO default_tenant_id FROM tenants WHERE business_name = 'La Rosca II' LIMIT 1;
    
    IF default_tenant_id IS NULL THEN
        INSERT INTO tenants (business_name, business_type) 
        VALUES ('La Rosca II', 'Hardware Store')
        RETURNING id INTO default_tenant_id;
    END IF;

    -- ------------------------------------------------------------------------------
    -- 3. ASOCIAR TABLAS EXISTENTES AL TENANT
    -- ------------------------------------------------------------------------------
    
    -- TABLA PRODUCTOS
    ALTER TABLE productos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
    UPDATE productos SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    ALTER TABLE productos ALTER COLUMN tenant_id SET NOT NULL;
    
    -- TABLA CLIENTES (Los clientes de tu cliente)
    ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
    UPDATE clientes SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    ALTER TABLE clientes ALTER COLUMN tenant_id SET NOT NULL;
    
    -- TABLA VENTAS
    ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
    UPDATE ventas SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    ALTER TABLE ventas ALTER COLUMN tenant_id SET NOT NULL;
    
END $$;

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
-- Las políticas aseguran que cada tenant solo pueda leer y escribir SUS propios datos.
-- NOTA: Se asume que el token JWT (auth.uid()) está mapeado a un tenant_id en tu tabla de perfiles.
-- Aquí definimos la regla base: Todo operará según el "tenant_id".

-- Productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Productos" ON productos
    FOR SELECT USING (true); -- Ajustar a: USING (tenant_id = (SELECT tenant_id FROM perfiles WHERE user_id = auth.uid()));

CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Productos" ON productos
    FOR ALL USING (true);    -- Ajustar a: USING (tenant_id = (SELECT tenant_id FROM perfiles WHERE user_id = auth.uid()));

-- Clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Clientes" ON clientes
    FOR SELECT USING (true);

CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Clientes" ON clientes
    FOR ALL USING (true);

-- Ventas
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Ventas" ON ventas
    FOR SELECT USING (true);

CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Ventas" ON ventas
    FOR ALL USING (true);

-- IMPORTANTE DE SEGURIDAD: 
-- Hemos dejado 'USING (true)' (abierto) temporalmente para que el sistema siga 
-- funcionando hasta que vincules formalmente la tabla 'perfiles' (usuarios de auth) 
-- con el nuevo 'tenant_id'. Cuando lo hagas, cambia el 'true' por la regla de validación real.
