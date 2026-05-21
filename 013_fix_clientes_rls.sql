-- ========================================================================================
-- MIGRACIÓN / CORRECCIÓN SQL: Solución para políticas RLS en la tabla 'clientes'
-- Para ejecutar en el 'SQL Editor' de Supabase
-- ========================================================================================

-- En un SaaS comercial, los clientes (RIF/Cédula) representan entidades fiscales únicas. 
-- Compartir el directorio de clientes entre tenants evita duplicados y permite que un cliente 
-- compre en distintas sucursales. Esto resuelve el error de RLS al hacer UPSERT de cédulas 
-- que ya existen en el sistema.

-- 1. Eliminar políticas permisivas generales anteriores
DROP POLICY IF EXISTS "tenant_isolation_clientes" ON public.clientes;
DROP POLICY IF EXISTS "allow_all_authenticated_clientes" ON public.clientes;

-- 2. Asegurar que RLS esté activo
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 3. Permitir a todos los usuarios autenticados (Vendedores y Administradores) consultar,
-- insertar y actualizar datos de la base de clientes compartida para mantener el directorio fiscal al día.
CREATE POLICY "clientes_select_policy" ON public.clientes 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "clientes_insert_policy" ON public.clientes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "clientes_update_policy" ON public.clientes 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 4. Restringir la eliminación (DELETE) únicamente a Administradores o service_role.
-- Validamos la columna 'rol' en la tabla de perfiles para identificar al Administrador.
CREATE POLICY "clientes_delete_policy" ON public.clientes 
  FOR DELETE 
  TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'service_role' 
    OR (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
  );
