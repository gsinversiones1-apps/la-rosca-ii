-- ==============================================================================
-- MIGRACIÓN DE ESQUEMA SAAS GLOBAL MULTI-TENANT
-- Este script adapta la base de datos a estándares internacionales.
-- IMPORTANTE: Ejecutar en el SQL Editor de Supabase.
-- ==============================================================================

-- Habilitar extensión para generar UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. RENOMBRADO DE COLUMNAS - TABLA: PRODUCTOS
-- ------------------------------------------------------------------------------
-- Eliminamos el check constraint restrictivo de la categoría (Ferreteria, etc.)
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_area_check;

-- Renombramos columnas a nombres estándar SaaS
ALTER TABLE productos 
  RENAME COLUMN codigo_skv TO sku;

ALTER TABLE productos 
  RENAME COLUMN nombre TO name;

ALTER TABLE productos 
  RENAME COLUMN area TO category;

ALTER TABLE productos 
  RENAME COLUMN medida TO uom;

ALTER TABLE productos 
  RENAME COLUMN stock TO stock_quantity;

ALTER TABLE productos 
  RENAME COLUMN stock_minimo TO min_stock_level;

ALTER TABLE productos 
  RENAME COLUMN precio_usd TO base_price;

-- Añadimos columnas estándar de tracking
ALTER TABLE productos 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 2. RENOMBRADO DE COLUMNAS - TABLA: CLIENTES
-- ------------------------------------------------------------------------------
ALTER TABLE clientes 
  RENAME COLUMN cedula TO tax_id;

ALTER TABLE clientes 
  RENAME COLUMN nombre TO first_name;

ALTER TABLE clientes 
  RENAME COLUMN apellido TO last_name;

ALTER TABLE clientes 
  RENAME COLUMN direccion TO address;

ALTER TABLE clientes 
  RENAME COLUMN telefono TO phone_number;

ALTER TABLE clientes 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 3. RENOMBRADO DE COLUMNAS - TABLA: VENTAS
-- ------------------------------------------------------------------------------
ALTER TABLE ventas 
  RENAME COLUMN producto_id TO product_id;

ALTER TABLE ventas 
  RENAME COLUMN cantidad TO quantity;

ALTER TABLE ventas 
  RENAME COLUMN tasa_dia TO exchange_rate;

ALTER TABLE ventas 
  RENAME COLUMN total_bs TO total_local_currency;

-- total_usd lo vamos a llamar total_amount (si la base de la DB es USD)
ALTER TABLE ventas 
  RENAME COLUMN total_usd TO total_amount;

ALTER TABLE ventas 
  RENAME COLUMN fecha_venta TO created_at;

-- ------------------------------------------------------------------------------
-- 4. ACTUALIZACIÓN DEL TRIGGER DE STOCK AUTOMÁTICO
-- ------------------------------------------------------------------------------
-- Actualizamos la función que usa los nombres viejos
CREATE OR REPLACE FUNCTION descontar_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- NOTA SOBRE MIGRACIÓN A UUID PRIMARY KEYS:
-- Actualmente las tablas usan 'id SERIAL'. Para migrar las primary keys 
-- y sus foreign keys a UUID en producción se requiere un proceso de 5 pasos 
-- (crear nueva columna, propagar UUIDs, recrear constraints y renombrar).
-- Por seguridad de los datos actuales, este script prioriza la estandarización
-- semántica de columnas. La migración a UUID en primary keys de productos/clientes
-- puede realizarse como una fase 2 si la DB está vacía o recién iniciando.
-- ------------------------------------------------------------------------------
