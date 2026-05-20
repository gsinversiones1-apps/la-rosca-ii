-- ========================================================================================
-- MIGRACIÓN / CORRECCIÓN SQL: Solución para políticas RLS en la tabla 'clientes'
-- Para ejecutar en el 'SQL Editor' de Supabase
-- ========================================================================================

-- ----------------------------------------------------------------------------------------
-- OPCIÓN A (RECOMENDADA & DIRECTA): Clientes Compartidos / Globales
-- ----------------------------------------------------------------------------------------
-- En un SaaS comercial, los clientes (RIF/Cédula) representan entidades fiscales únicas. 
-- Compartir el directorio de clientes entre tenants evita duplicados y permite que un cliente 
-- compre en distintas sucursales. Esto resuelve el error de RLS al hacer UPSERT de cédulas 
-- que ya existen en el sistema.

-- 1. Deshabilitar temporalmente o recrear las políticas
DROP POLICY IF EXISTS "tenant_isolation_clientes" ON public.clientes;
DROP POLICY IF EXISTS "tenant_isolation_clientes_select" ON public.clientes;
DROP POLICY IF EXISTS "tenant_isolation_clientes_insert" ON public.clientes;
DROP POLICY IF EXISTS "tenant_isolation_clientes_update" ON public.clientes;
DROP POLICY IF EXISTS "tenant_isolation_clientes_delete" ON public.clientes;

-- 2. Habilitar seguridad de nivel de fila (por si acaso no estuviera activa)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas que permitan acceso total a usuarios AUTENTICADOS (Vendedores/Admins)
-- para que puedan buscar, registrar y actualizar la base de datos de clientes compartida.
CREATE POLICY "allow_all_authenticated_clientes" ON public.clientes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Nota: Si prefieres mantener aislamiento estricto por Tenant, usa la OPCIÓN B de abajo.


-- ----------------------------------------------------------------------------------------
-- OPCIÓN B (AISLAMIENTO ESTRICTO POR TENANT): Clientes Privados por Sucursal
-- ----------------------------------------------------------------------------------------
-- Si deseas que las sucursales NO compartan clientes bajo ningún concepto, la cédula debe
-- ser única SOLO dentro de cada tenant. Para lograr esto, se debe remover el constraint único
-- global de la cédula y añadir uno compuesto (tenant_id, cedula).
--
-- Para aplicar la Opción B, descomenta y ejecuta el siguiente bloque:
/*
-- 1. Eliminar restricción de cédula única global si existe (ej. clientes_cedula_key)
-- ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_cedula_key;

-- 2. Crear restricción de unicidad compuesta
-- ALTER TABLE public.clientes ADD CONSTRAINT uq_clientes_tenant_cedula UNIQUE (tenant_id, cedula);

-- 3. Recrear políticas de aislamiento estrictas por Tenant
DROP POLICY IF EXISTS "tenant_isolation_clientes" ON public.clientes;
CREATE POLICY "tenant_isolation_clientes" ON public.clientes
  FOR ALL
  TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());
*/
