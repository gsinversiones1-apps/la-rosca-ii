-- ==============================================================================
-- 019 - SCRIPT DE ONBOARDING PARA NUEVOS CLIENTES SAAS
-- Úsalo para registrar un nuevo negocio y vincular a su dueño
-- ==============================================================================

DO $$
DECLARE
    nuevo_tenant_id UUID;
    correo_cliente TEXT := 'sierrakarelis2@gmail.com'; 
    nombre_negocio TEXT := 'Ferretería Industrial C.A.'; 
BEGIN
    -- 1. Verificamos que el usuario ya exista en auth.users (Supabase Auth)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = correo_cliente) THEN
        RAISE EXCEPTION 'El usuario % no existe. Por favor, créalo primero en Authentication.', correo_cliente;
    END IF;

    -- 2. Creamos el nuevo Negocio (Tenant) llenando la columna obligatoria 'nombre_tienda'
    INSERT INTO tenants (business_name, business_type, nombre_tienda)
    VALUES (nombre_negocio, 'Ferretería', nombre_negocio)
    RETURNING id INTO nuevo_tenant_id;

    -- 3. Movemos el perfil del usuario al nuevo Negocio y le damos rango de Administrador
    UPDATE perfiles 
    SET tenant_id = nuevo_tenant_id, 
        rol = 'admin'
    WHERE user_id = (SELECT id FROM auth.users WHERE email = correo_cliente LIMIT 1);
    
END $$;
