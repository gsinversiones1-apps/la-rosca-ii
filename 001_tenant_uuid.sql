-- Convertimos las columnas a UUID en las tres tablas
ALTER TABLE productos 
  ALTER COLUMN tenant_id TYPE UUID USING tenant_id::uuid;

ALTER TABLE ventas 
  ALTER COLUMN tenant_id TYPE UUID USING tenant_id::uuid;

ALTER TABLE clientes 
  ALTER COLUMN tenant_id TYPE UUID USING tenant_id::uuid;

-- Esta función lee el ID del usuario y lo prepara para las políticas RLS
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Importante: Configuramos el valor por defecto de tenant_id para que 
-- los inserts desde el frontend no fallen al omitir el campo
ALTER TABLE productos ALTER COLUMN tenant_id SET DEFAULT auth.uid();
ALTER TABLE ventas ALTER COLUMN tenant_id SET DEFAULT auth.uid();
ALTER TABLE clientes ALTER COLUMN tenant_id SET DEFAULT auth.uid();

-- Ahora, vamos a actualizar tus políticas para que usen esta función 
-- en lugar de intentar leer un campo que quizás no venga en el JWT aún.
DROP POLICY IF EXISTS "tenant_isolation_productos" ON productos;
CREATE POLICY "tenant_isolation_productos" ON productos
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "tenant_isolation_ventas" ON ventas;
CREATE POLICY "tenant_isolation_ventas" ON ventas
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "tenant_isolation_clientes" ON clientes;
CREATE POLICY "tenant_isolation_clientes" ON clientes
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());
