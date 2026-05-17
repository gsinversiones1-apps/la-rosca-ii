-- 1. Eliminamos el índice o columna si existiera algo previo (limpieza proactiva)
DROP INDEX IF EXISTS idx_productos_fts;

-- 2. Creamos la columna generada con PESOS (Weights) para búsqueda inteligente
-- Prioridad A: Nombre (Más importante)
-- Prioridad B: Area
-- Prioridad C: Código SKV
ALTER TABLE productos 
ADD COLUMN buscador tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('spanish', coalesce(nombre, '')), 'A') ||
  setweight(to_tsvector('spanish', coalesce(area, '')), 'B') ||
  setweight(to_tsvector('spanish', coalesce(codigo_skv, '')), 'C')
) STORED;

-- 3. El Índice GIN de alta velocidad
CREATE INDEX idx_productos_fts ON productos USING GIN (buscador);

-- 4. (Opcional) Si existe la tabla 'inventario' como tabla física, aplicar lo mismo. 
-- Si es una vista, no es necesario.
-- ALTER TABLE inventario ADD COLUMN fts_vector... (etc)
