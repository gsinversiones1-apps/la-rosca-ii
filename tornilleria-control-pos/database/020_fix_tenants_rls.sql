-- ==============================================================================
-- 020 - FIX: POLÍTICAS RLS PARA LA TABLA TENANTS
-- Permite que los usuarios puedan leer el nombre de su propio negocio.
-- ==============================================================================

-- 1. Habilitamos RLS en la tabla tenants (por si acaso)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Borramos políticas viejas si existen
DROP POLICY IF EXISTS "Aislamiento Multi-Tenant: Lectura de Tenants" ON public.tenants;

-- 3. Creamos la política: Un usuario solo puede ver la fila de 'tenants' que coincide con su tenant_id
CREATE POLICY "Aislamiento Multi-Tenant: Lectura de Tenants" 
ON public.tenants 
FOR SELECT 
USING (
    id = (SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid() LIMIT 1)
);
