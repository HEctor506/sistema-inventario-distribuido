import { pool } from '../config/db.js';

export const listarProductos = async (req, res) => {
  try {
    const { buscar, categoria_id, proveedor_id } = req.query;
    let query = `
      SELECT p.*, c.nombre as categoria_nombre, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.proveedor_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (buscar && buscar.trim()) {
      query += ` AND (p.nombre ILIKE $${idx} OR p.descripcion ILIKE $${idx})`;
      params.push(`%${buscar.trim()}%`);
      idx++;
    }
    if (categoria_id) {
      query += ` AND p.categoria_id = $${idx}`;
      params.push(categoria_id);
      idx++;
    }
    if (proveedor_id) {
      query += ` AND p.proveedor_id = $${idx}`;
      params.push(proveedor_id);
      idx++;
    }

    query += ` ORDER BY p.producto_id`;

    const [productosRes, categoriasRes, proveedoresRes] = await Promise.all([
      pool.query(query, params),
      pool.query('SELECT categoria_id, nombre FROM categorias ORDER BY nombre'),
      pool.query('SELECT proveedor_id, nombre FROM proveedores ORDER BY nombre')
    ]);

    const productosConStockBajo = productosRes.rows.filter(p => p.stock_actual <= p.stock_minimo);

    res.render('productos/lista', {
      productos: productosRes.rows,
      categorias: categoriasRes.rows,
      proveedores: proveedoresRes.rows,
      productosStockBajo: productosConStockBajo.length,
      title: 'Productos',
      success: req.query.success,
      error: req.query.error,
      filtros: { buscar, categoria_id, proveedor_id }
    });
  } catch (error) {
    console.error(error);
    res.render('productos/lista', { productos: [], categorias: [], proveedores: [], productosStockBajo: 0, error: 'Error al cargar productos' });
  }
};

export const mostrarFormCrear = async (req, res) => {
  try {
    const [categoriasRes, proveedoresRes] = await Promise.all([
      pool.query('SELECT categoria_id, nombre FROM categorias ORDER BY nombre'),
      pool.query('SELECT proveedor_id, nombre FROM proveedores ORDER BY nombre')
    ]);
    res.render('productos/form', {
      producto: null,
      categorias: categoriasRes.rows,
      proveedores: proveedoresRes.rows,
      title: 'Nuevo Producto',
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/productos?error=' + encodeURIComponent('Error al cargar formulario'));
  }
};

export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_unitario, stock_actual, stock_minimo, categoria_id, proveedor_id } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.redirect('/productos/crear?error=' + encodeURIComponent('El nombre es obligatorio'));
    }
    const precio = parseFloat(precio_unitario);
    if (isNaN(precio) || precio < 0) {
      return res.redirect('/productos/crear?error=' + encodeURIComponent('Precio inválido'));
    }
    const stock = parseInt(stock_actual, 10);
    const stockMin = parseInt(stock_minimo, 10);
    if (isNaN(stock) || stock < 0 || isNaN(stockMin) || stockMin < 0) {
      return res.redirect('/productos/crear?error=' + encodeURIComponent('Stock inválido'));
    }
    if (!categoria_id || !proveedor_id) {
      return res.redirect('/productos/crear?error=' + encodeURIComponent('Categoría y proveedor son obligatorios'));
    }

    await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio_unitario, stock_actual, stock_minimo, categoria_id, proveedor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nombre.trim(), descripcion?.trim() || null, precio, stock, stockMin, categoria_id, proveedor_id]
    );
    res.redirect('/productos?success=' + encodeURIComponent('Producto creado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/productos/crear?error=' + encodeURIComponent('Error al crear producto'));
  }
};

export const mostrarFormEditar = async (req, res) => {
  try {
    const { id } = req.params;
    const [productoRes, categoriasRes, proveedoresRes] = await Promise.all([
      pool.query('SELECT * FROM productos WHERE producto_id = $1', [id]),
      pool.query('SELECT categoria_id, nombre FROM categorias ORDER BY nombre'),
      pool.query('SELECT proveedor_id, nombre FROM proveedores ORDER BY nombre')
    ]);

    if (productoRes.rows.length === 0) {
      return res.redirect('/productos?error=' + encodeURIComponent('Producto no encontrado'));
    }

    res.render('productos/form', {
      producto: productoRes.rows[0],
      categorias: categoriasRes.rows,
      proveedores: proveedoresRes.rows,
      title: 'Editar Producto',
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/productos?error=' + encodeURIComponent('Error al cargar formulario'));
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio_unitario, stock_actual, stock_minimo, categoria_id, proveedor_id } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.redirect('/productos/editar/' + id + '?error=' + encodeURIComponent('El nombre es obligatorio'));
    }
    const precio = parseFloat(precio_unitario);
    if (isNaN(precio) || precio < 0) {
      return res.redirect('/productos/editar/' + id + '?error=' + encodeURIComponent('Precio inválido'));
    }
    const stock = parseInt(stock_actual, 10);
    const stockMin = parseInt(stock_minimo, 10);
    if (isNaN(stock) || stock < 0 || isNaN(stockMin) || stockMin < 0) {
      return res.redirect('/productos/editar/' + id + '?error=' + encodeURIComponent('Stock inválido'));
    }
    if (!categoria_id || !proveedor_id) {
      return res.redirect('/productos/editar/' + id + '?error=' + encodeURIComponent('Categoría y proveedor son obligatorios'));
    }

    const result = await pool.query(
      `UPDATE productos SET nombre=$1, descripcion=$2, precio_unitario=$3, stock_actual=$4, stock_minimo=$5, categoria_id=$6, proveedor_id=$7
       WHERE producto_id = $8`,
      [nombre.trim(), descripcion?.trim() || null, precio, stock, stockMin, categoria_id, proveedor_id, id]
    );

    if (result.rowCount === 0) {
      return res.redirect('/productos?error=' + encodeURIComponent('Producto no encontrado'));
    }
    res.redirect('/productos?success=' + encodeURIComponent('Producto actualizado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/productos?error=' + encodeURIComponent('Error al actualizar producto'));
  }
};

export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM productos WHERE producto_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.redirect('/productos?error=' + encodeURIComponent('Producto no encontrado'));
    }
    res.redirect('/productos?success=' + encodeURIComponent('Producto eliminado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/productos?error=' + encodeURIComponent('Error al eliminar producto (revise dependencias)'));
  }
};
