-- ==============================================================================
-- Migración 011: Sistema de Roles (RBAC) y Seguridad de Inventario
-- ==============================================================================

-- 1. Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'vendedor')) DEFAULT 'vendedor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS en perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver su propio perfil
CREATE POLICY "Ver propio perfil" ON public.perfiles 
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Trigger para crear perfil automáticamente al registrarse en Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- El primer usuario registrado será 'admin' por conveniencia, los demás 'vendedor'
  IF NOT EXISTS (SELECT 1 FROM public.perfiles) THEN
    INSERT INTO public.perfiles (user_id, rol) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.perfiles (user_id, rol) VALUES (NEW.id, 'vendedor');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Políticas RLS para la tabla PRODUCTOS (Seguridad RBAC)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Primero eliminamos políticas antiguas si existen
DROP POLICY IF EXISTS "Todos pueden ver productos" ON public.productos;
DROP POLICY IF EXISTS "Solo admin puede insertar" ON public.productos;
DROP POLICY IF EXISTS "Solo admin puede actualizar" ON public.productos;
DROP POLICY IF EXISTS "Solo admin puede eliminar" ON public.productos;

-- A. Vendedores y Admins (todos autenticados) pueden VER el inventario
CREATE POLICY "Todos pueden ver productos" ON public.productos
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- B. Solo ADMIN puede INSERTAR
CREATE POLICY "Solo admin puede insertar" ON public.productos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.perfiles WHERE user_id = auth.uid() AND rol = 'admin')
  );

-- C. Solo ADMIN puede ACTUALIZAR (Editar)
CREATE POLICY "Solo admin puede actualizar" ON public.productos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE user_id = auth.uid() AND rol = 'admin')
  );

-- D. Solo ADMIN puede ELIMINAR
CREATE POLICY "Solo admin puede eliminar" ON public.productos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE user_id = auth.uid() AND rol = 'admin')
  );

-- ==============================================================================
-- 5. Migración de datos existentes al tenant principal (La Rosca II)
-- ==============================================================================
-- Actualiza los registros antiguos para asociarlos al nuevo UUID del tenant 'Tornillería La Rosca II'
UPDATE public.productos 
SET tenant_id = '70dcc2c6-07ea-448f-8728-c8242fe96544'::text 
WHERE tenant_id = 'ROSC-001-VNZ' OR tenant_id IS NULL;

UPDATE public.ventas 
SET tenant_id = '70dcc2c6-07ea-448f-8728-c8242fe96544'::text 
WHERE tenant_id = 'ROSC-001-VNZ' OR tenant_id IS NULL;

UPDATE public.clientes 
SET tenant_id = '70dcc2c6-07ea-448f-8728-c8242fe96544'::text 
WHERE tenant_id = 'ROSC-001-VNZ' OR tenant_id IS NULL;

