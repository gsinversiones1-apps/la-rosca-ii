-- ==============================================================================
-- SCRIPT 1 (VERSIÓN DEFINITIVA CON DYNAMIC SQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  -- Intentar eliminar el constraint si existe (se ignora si no existe)
  BEGIN
    ALTER TABLE productos DROP CONSTRAINT productos_area_check;
  EXCEPTION
    WHEN undefined_object THEN null;
  END;
END $$;

DO $$ 
BEGIN 
  -- ------------------------------------------------------------------------------
  -- 1. TABLA PRODUCTOS
  -- ------------------------------------------------------------------------------
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='codigo_skv') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN codigo_skv TO sku';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='nombre') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN nombre TO name';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='area') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN area TO category';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='medida') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN medida TO uom';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='stock') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN stock TO stock_quantity';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='stock_minimo') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN stock_minimo TO min_stock_level';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='precio_usd') THEN
      EXECUTE 'ALTER TABLE productos RENAME COLUMN precio_usd TO base_price';
  END IF;

  -- ------------------------------------------------------------------------------
  -- 2. TABLA CLIENTES
  -- ------------------------------------------------------------------------------
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='cedula') THEN
      EXECUTE 'ALTER TABLE clientes RENAME COLUMN cedula TO tax_id';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='nombre') THEN
      EXECUTE 'ALTER TABLE clientes RENAME COLUMN nombre TO first_name';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='apellido') THEN
      EXECUTE 'ALTER TABLE clientes RENAME COLUMN apellido TO last_name';
  END IF;
  
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='direccion') THEN
      EXECUTE 'ALTER TABLE clientes RENAME COLUMN direccion TO address';
  ELSE
      IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='address') THEN
          EXECUTE 'ALTER TABLE clientes ADD COLUMN address TEXT';
      END IF;
  END IF;
  
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='telefono') THEN
      EXECUTE 'ALTER TABLE clientes RENAME COLUMN telefono TO phone_number';
  ELSE
      IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='phone_number') THEN
          EXECUTE 'ALTER TABLE clientes ADD COLUMN phone_number TEXT';
      END IF;
  END IF;

  -- ------------------------------------------------------------------------------
  -- 3. TABLA VENTAS
  -- ------------------------------------------------------------------------------
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='producto_id') THEN
      EXECUTE 'ALTER TABLE ventas RENAME COLUMN producto_id TO product_id';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='cantidad') THEN
      EXECUTE 'ALTER TABLE ventas RENAME COLUMN cantidad TO quantity';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='tasa_dia') THEN
      EXECUTE 'ALTER TABLE ventas RENAME COLUMN tasa_dia TO exchange_rate';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='total_bs') THEN
      EXECUTE 'ALTER TABLE ventas RENAME COLUMN total_bs TO total_local_currency';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='total_usd') THEN
      EXECUTE 'ALTER TABLE ventas RENAME COLUMN total_usd TO total_amount';
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ventas' AND column_name='fecha_venta') THEN
      EXECUTE 'ALTER TABLE ventas RENAME COLUMN fecha_venta TO created_at';
  END IF;
END $$;

-- Añadimos columnas de tracking si no existen
ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Recrear el Trigger de Stock
CREATE OR REPLACE FUNCTION descontar_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
