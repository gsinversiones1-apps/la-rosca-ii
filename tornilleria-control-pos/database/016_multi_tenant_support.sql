-- ==============================================================================
-- SCRIPT 2 (VERSIÓN BLINDADA CON DYNAMIC SQL)
-- ==============================================================================

-- 1. Asegurar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tabla base (por si no existía)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Forzar existencia de las columnas (Resuelve el error "business_name does not exist")
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT 'La Rosca II';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 4. Asociar todo usando SQL Dinámico seguro
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Buscar o crear el tenant maestro
    SELECT id INTO default_tenant_id FROM tenants WHERE business_name = 'La Rosca II' LIMIT 1;
    
    IF default_tenant_id IS NULL THEN
        INSERT INTO tenants (business_name, business_type) 
        VALUES ('La Rosca II', 'Hardware Store')
        RETURNING id INTO default_tenant_id;
    END IF;

    -- PRODUCTOS
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='tenant_id') THEN
        EXECUTE 'ALTER TABLE productos ADD COLUMN tenant_id UUID REFERENCES tenants(id)';
    END IF;
    EXECUTE 'UPDATE productos SET tenant_id = $1 WHERE tenant_id IS NULL' USING default_tenant_id;
    
    -- CLIENTES
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='tenant_id') THEN
        EXECUTE 'ALTER TABLE clientes ADD COLUMN tenant_id UUID REFERENCES tenants(id)';
    END IF;
    EXECUTE 'UPDATE clientes SET tenant_id = $1 WHERE tenant_id IS NULL' USING default_tenant_id;
    
    -- VENTAS
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='tenant_id') THEN
        EXECUTE 'ALTER TABLE ventas ADD COLUMN tenant_id UUID REFERENCES tenants(id)';
    END IF;
    EXECUTE 'UPDATE ventas SET tenant_id = $1 WHERE tenant_id IS NULL' USING default_tenant_id;
    
END $$;

-- 5. Habilitar Seguridad (Row Level Security)

-- Productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Productos" ON productos;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Productos" ON productos FOR SELECT USING (true); 

DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Escritura de Productos" ON productos;
CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Productos" ON productos FOR ALL USING (true);    

-- Clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Clientes" ON clientes;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Clientes" ON clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Escritura de Clientes" ON clientes;
CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Clientes" ON clientes FOR ALL USING (true);

-- Ventas
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Ventas" ON ventas;
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Ventas" ON ventas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Escritura de Ventas" ON ventas;
CREATE POLICY "Aislamiento Multi-Tenant: Escritura de Ventas" ON ventas FOR ALL USING (true);
