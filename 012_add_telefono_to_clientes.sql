-- Migración para añadir columna de teléfono a la tabla de clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono TEXT;
