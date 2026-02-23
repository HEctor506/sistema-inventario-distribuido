import { pool } from '../config/db.js';

export const listarMovimientos = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, tipo, producto_id } = req.query;
    let query = `
      SELECT m.*, p.nombre as producto_nombre, pr.nombre as proveedor_nombre
      FROM movimientos_inventario m
      LEFT JOIN productos p ON m.producto_id = p.producto_id
      LEFT JOIN proveedores pr ON m.proveedor_id = pr.proveedor_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (fecha_desde) { query += ` AND m.fecha >= $${idx}`; params.push(fecha_desde); idx++; }
    if (fecha_hasta) { query += ` AND m.fecha <= $${idx}`; params.push(fecha_hasta + ' 23:59:59'); idx++; }
    if (tipo) { query += ` AND m.tipo = $${idx}`; params.push(tipo); idx++; }
    if (producto_id) { query += ` AND m.producto_id = $${idx}`; params.push(producto_id); idx++; }
    query += ' ORDER BY m.fecha DESC LIMIT 100';
    const result = await pool.query(query, params);
    const productosRes = await pool.query('SELECT producto_id, nombre FROM productos ORDER BY nombre');
    res.render('movimientos/lista', {
      movimientos: result.rows,
      productos: productosRes.rows,
      title: 'Movimientos',
      success: req.query.success,
      error: req.query.error,
      filtros: { fecha_desde, fecha_hasta, tipo, producto_id }
    });
  } catch (error) {
    console.error(error);
    res.render('movimientos/lista', { movimientos: [], productos: [], error: 'Error al cargar movimientos' });
  }
};

export const mostrarFormEntrada = async (req, res) => {
  try {
    const [productosRes, proveedoresRes] = await Promise.all([
      pool.query('SELECT producto_id, nombre, stock_actual FROM productos ORDER BY nombre'),
      pool.query('SELECT proveedor_id, nombre FROM proveedores ORDER BY nombre')
    ]);
    res.render('movimientos/form', {
      tipo: 'entrada',
      productos: productosRes.rows,
      proveedores: proveedoresRes.rows,
      title: 'Registrar Entrada',
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/movimientos?error=' + encodeURIComponent('Error al cargar formulario'));
  }
};

export const mostrarFormSalida = async (req, res) => {
  try {
    const productosRes = await pool.query('SELECT producto_id, nombre, stock_actual FROM productos ORDER BY nombre');
    res.render('movimientos/form', {
      tipo: 'salida',
      productos: productosRes.rows,
      proveedores: [],
      title: 'Registrar Salida',
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/movimientos?error=' + encodeURIComponent('Error al cargar formulario'));
  }
};

export const registrarMovimiento = async (req, res) => {
  try {
    const { producto_id, proveedor_id, cantidad, observacion, motivo } = req.body;
    const tipo = req.path.includes('entrada') ? 'entrada' : 'salida';
    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.redirect('/movimientos/' + tipo + '?error=' + encodeURIComponent('Producto y cantidad obligatorios'));
    }
    const cant = parseInt(cantidad, 10);
    if (isNaN(cant) || cant <= 0) {
      return res.redirect('/movimientos/' + tipo + '?error=' + encodeURIComponent('Cantidad inválida'));
    }
    const productoRes = await pool.query('SELECT stock_actual FROM productos WHERE producto_id = $1', [producto_id]);
    if (productoRes.rows.length === 0) {
      return res.redirect('/movimientos/' + tipo + '?error=' + encodeURIComponent('Producto no encontrado'));
    }
    const stockActual = parseInt(productoRes.rows[0].stock_actual, 10);
    if (tipo === 'salida' && cant > stockActual) {
      return res.redirect('/movimientos/salida?error=' + encodeURIComponent('Stock insuficiente. Disponible: ' + stockActual));
    }
    await pool.query(
      `INSERT INTO movimientos_inventario (producto_id, proveedor_id, tipo, cantidad, observacion, motivo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [producto_id, proveedor_id || null, tipo, cant, observacion?.trim() || null, motivo?.trim() || null]
    );
    const nuevoStock = tipo === 'entrada' ? stockActual + cant : stockActual - cant;
    await pool.query('UPDATE productos SET stock_actual = $1 WHERE producto_id = $2', [nuevoStock, producto_id]);
    res.redirect('/movimientos?success=' + encodeURIComponent('Movimiento registrado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/movimientos?error=' + encodeURIComponent('Error al registrar movimiento'));
  }
};
