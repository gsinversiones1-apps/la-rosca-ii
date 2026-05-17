-- Función que será ejecutada por el trigger
CREATE OR REPLACE FUNCTION procesar_venta_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_stock_actual INT;
BEGIN
  -- 1. Aislar por Tenant y obtener el stock actual bloqueando la fila para actualización concurrente
  SELECT stock INTO v_stock_actual
  FROM productos
  WHERE id = NEW.producto_id 
    AND tenant_id = auth.uid() -- Aislamiento estricto de seguridad
  FOR UPDATE; -- Previene condiciones de carrera si dos ventas ocurren al mismo milisegundo

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
  WHERE id = NEW.producto_id
    AND tenant_id = auth.uid();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Eliminar el trigger si existe para poder recrearlo
DROP TRIGGER IF EXISTS trigger_restar_stock ON ventas;

-- Crear el trigger que se ejecuta ANTES de insertar la venta
CREATE TRIGGER trigger_restar_stock
BEFORE INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION procesar_venta_stock();
