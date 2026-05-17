-- 1. Aseguramos que ningún registro futuro pueda existir sin estar asignado a un Tenant
ALTER TABLE productos ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE ventas ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE clientes ALTER COLUMN tenant_id SET NOT NULL;

-- 2. Vinculamos forzosamente el tenant_id a un usuario real de Supabase Auth
-- Esto evita la creación de "Tenants fantasma" y garantiza integridad referencial
ALTER TABLE productos 
  ADD CONSTRAINT fk_productos_tenant 
  FOREIGN KEY (tenant_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE ventas 
  ADD CONSTRAINT fk_ventas_tenant 
  FOREIGN KEY (tenant_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE clientes 
  ADD CONSTRAINT fk_clientes_tenant 
  FOREIGN KEY (tenant_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
