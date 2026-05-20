-- Función que será ejecutada por el trigger (VERSIÓN CORREGIDA TIPOS DE DATOS)
CREATE OR REPLACE FUNCTION procesar_venta_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_stock_actual INT;
BEGIN
  -- 1. Aislar por Tenant y obtener el stock actual bloqueando la fila para actualización concurrente
  -- Se usa ::text para evitar el error "operator does not exist: text = uuid"
  SELECT stock INTO v_stock_actual
  FROM productos
  WHERE id::text = NEW.producto_id::text 
    AND tenant_id::text = auth.uid()::text
  FOR UPDATE; 

  -- 2. Validar que el producto exista y pertenezca al tenant
  IF v_stock_actual IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado o no pertenece al Tenant actual.';
  END IF;

  -- 3. Validar que haya stock suficiente
  IF v_stock_actual < NEW.cantidad THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock para el producto ID % (Solicitado: %, Disponible: %)', NEW.producto_id, NEW.cantidad, v_stock_actual;
  END IF;

  -- 4. Restar el stock
  UPDATE productos
  SET stock = stock - NEW.cantidad
  WHERE id::text = NEW.producto_id::text
    AND tenant_id::text = auth.uid()::text;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
