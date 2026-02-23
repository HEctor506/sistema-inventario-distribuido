CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT
);

CREATE TABLE proveedores (
    proveedor_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    contacto VARCHAR(50),
    telefono VARCHAR(15),
    email VARCHAR(100),
    direccion TEXT
);

CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    precio_unitario NUMERIC(10,2) NOT NULL,
    stock_actual INT NOT NULL,
    stock_minimo INT NOT NULL,
    categoria_id INT NOT NULL REFERENCES categorias(categoria_id),
    proveedor_id INT NOT NULL REFERENCES proveedores(proveedor_id)
);

CREATE TABLE movimientos_inventario (
    movimiento_id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(producto_id) ON DELETE CASCADE,
    proveedor_id INT REFERENCES proveedores(proveedor_id) ON DELETE SET NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT,
    motivo TEXT
);

-- 5 Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas','Líquidos para consumo'),
('Snacks','Alimentos ligeros'),
('Limpieza','Productos de aseo'),
('Lacteos','Derivados de leche'),
('Abarrotes','Productos secos');

-- 5 Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
('Distribuidora Norte','Carlos Perez','0991111111','norte@mail.com','Quito'),
('Alimentos Andinos','Maria Lopez','0992222222','andinos@mail.com','Guayaquil'),
('Limpio SA','Jose Torres','0993333333','limpio@mail.com','Cuenca'),
('Lacteos Sierra','Ana Mena','0994444444','sierra@mail.com','Ambato'),
('Importadora Global','Luis Vega','0995555555','global@mail.com','Manta');

-- 20 Productos
INSERT INTO productos (nombre, descripcion, precio_unitario, stock_actual, stock_minimo, categoria_id, proveedor_id) VALUES
('Coca Cola 1L','Gaseosa',1.50,50,10,1,1),
('Pepsi 1L','Gaseosa',1.40,30,10,1,1),
('Agua 500ml','Agua pura',0.60,100,20,1,2),
('Papas Fritas','Snack salado',0.80,40,10,2,2),
('Galletas Oreo','Snack dulce',1.20,35,10,2,2),
('Detergente','Limpieza ropa',3.50,20,5,3,3),
('Cloro','Desinfectante',1.10,25,5,3,3),
('Leche Entera','Leche 1L',0.95,60,15,4,4),
('Yogurt','Yogurt fresa',0.75,45,10,4,4),
('Queso','Queso fresco',2.50,20,5,4,4),
('Arroz 1kg','Arroz blanco',1.00,80,20,5,5),
('Azucar 1kg','Azucar blanca',1.10,70,20,5,5),
('Aceite 1L','Aceite vegetal',2.20,40,10,5,5),
('Chocolate','Barra chocolate',0.90,50,10,2,2),
('Cereal','Cereal desayuno',2.80,30,5,5,5),
('Cafe','Cafe molido',3.00,25,5,5,5),
('Jugo Naranja','Jugo natural',1.30,20,5,1,1),
('Shampoo','Cuidado cabello',4.00,15,5,3,3),
('Mantequilla','Mantequilla 250g',1.50,20,5,4,4),
('Sal','Sal refinada',0.50,60,10,5,5);

-- 30 Movimientos
INSERT INTO movimientos_inventario (producto_id, proveedor_id, tipo, cantidad, observacion, motivo)
SELECT (random()*19+1)::int, (random()*4+1)::int,
       CASE WHEN random() > 0.5 THEN 'entrada' ELSE 'salida' END,
       (random()*10+1)::int,
       'Movimiento inicial','Carga sistema'
FROM generate_series(1,30);