-- 1. Crear la tabla de productos para La Rosca 2
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_skv TEXT UNIQUE NOT NULL, -- Ej: DW-01, AU-01
    nombre TEXT NOT NULL,
    area TEXT CHECK (area IN ('Drywall', 'Automotriz', 'Allen', 'General', 'Ferreteria')),
    medida TEXT,
    stock INTEGER DEFAULT 0,
    precio_usd DECIMAL(10,2) NOT NULL,
    stock_minimo INTEGER DEFAULT 50 -- Para las alertas
);

-- 2. Crear la tabla de ventas (para llevar el registro)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    tasa_dia DECIMAL(10,2),
    total_bs DECIMAL(10,2),
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. EL TRUCO MÁGICO: El Trigger de Descuento Automático
-- Esta función resta el stock automáticamente cada vez que vendes
CREATE OR REPLACE FUNCTION descontar_stock()
RETURNS TRIGGER AS $$BEGIN
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION descontar_stock();