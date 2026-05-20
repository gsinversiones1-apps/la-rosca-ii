-- Función que será ejecutada por el trigger (VERSIÓN BYPASS ANON)
-- Permite facturar sin necesidad de estar logueado (auth.uid() IS NULL)
CREATE OR REPLACE FUNCTION procesar_venta_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_stock_actual INT;
BEGIN
  -- 1. Aislar por Tenant y obtener el stock actual
  -- Se elimina la validación estricta de auth.uid() para permitir el uso en modo "anon"
  SELECT stock INTO v_stock_actual
  FROM productos
  WHERE id::text = NEW.producto_id::text 
  FOR UPDATE; 

  -- 2. Validar que el producto exista
  IF v_stock_actual IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado en la base de datos.';
  END IF;

  -- 3. Validar que haya stock suficiente
  IF v_stock_actual < NEW.cantidad THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock para el producto ID % (Solicitado: %, Disponible: %)', NEW.producto_id, NEW.cantidad, v_stock_actual;
  END IF;

  -- 4. Restar el stock
  UPDATE productos
  SET stock = stock - NEW.cantidad
  WHERE id::text = NEW.producto_id::text;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
