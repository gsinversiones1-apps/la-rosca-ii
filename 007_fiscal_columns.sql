-- 1. Añadimos las columnas necesarias a la tabla de ventas
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS iva_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igtf_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'PAGO MOVIL',
  ADD COLUMN IF NOT EXISTS cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL;

-- 2. Aseguramos que la columna tasa_dia existe (el usuario la mencionó, si ya está, esto no hará daño)
-- "tasa_dia" ya estaba en el schema según el código, pero en el prompt pide "tasa_dolar", la llamaremos tasa_dia para ser retrocompatibles con la app.

-- Comentario para el arquitecto de bases de datos
COMMENT ON COLUMN ventas.iva_amount IS 'Monto de IVA (16%) en USD de esta fila';
COMMENT ON COLUMN ventas.igtf_amount IS 'Monto de IGTF (3%) en USD si pagó en Divisas';
COMMENT ON COLUMN ventas.metodo_pago IS 'Ej. Divisas, Punto de Venta, Pago Móvil';
COMMENT ON COLUMN ventas.cliente_id IS 'Referencia al cliente. Si es NULL, se considera Consumidor Final';
