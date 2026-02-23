import { pool } from '../config/db.js';

export const listarCategorias = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.producto_id) as cantidad_productos
      FROM categorias c
      LEFT JOIN productos p ON c.categoria_id = p.categoria_id
      GROUP BY c.categoria_id, c.nombre, c.descripcion
      ORDER BY c.nombre
    `);
    res.render('categorias/lista', {
      categorias: result.rows,
      title: 'Categorías',
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.render('categorias/lista', { categorias: [], error: 'Error al cargar categorías' });
  }
};

export const mostrarFormCrear = async (req, res) => {
  res.render('categorias/form', {
    categoria: null,
    title: 'Nueva Categoría',
    error: req.query.error
  });
};

export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.redirect('/categorias/crear?error=' + encodeURIComponent('El nombre es obligatorio'));
    }
    await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2)',
      [nombre.trim(), descripcion?.trim() || null]
    );
    res.redirect('/categorias?success=' + encodeURIComponent('Categoría creada correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/categorias/crear?error=' + encodeURIComponent('Error al crear categoría'));
  }
};

export const mostrarFormEditar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categorias WHERE categoria_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.redirect('/categorias?error=' + encodeURIComponent('Categoría no encontrada'));
    }
    res.render('categorias/form', {
      categoria: result.rows[0],
      title: 'Editar Categoría',
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/categorias?error=' + encodeURIComponent('Error al cargar formulario'));
  }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.redirect('/categorias/editar/' + id + '?error=' + encodeURIComponent('El nombre es obligatorio'));
    }
    const result = await pool.query(
      'UPDATE categorias SET nombre=$1, descripcion=$2 WHERE categoria_id=$3',
      [nombre.trim(), descripcion?.trim() || null, id]
    );
    if (result.rowCount === 0) {
      return res.redirect('/categorias?error=' + encodeURIComponent('Categoría no encontrada'));
    }
    res.redirect('/categorias?success=' + encodeURIComponent('Categoría actualizada correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/categorias?error=' + encodeURIComponent('Error al actualizar categoría'));
  }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const countRes = await pool.query('SELECT COUNT(*) FROM productos WHERE categoria_id = $1', [id]);
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return res.redirect('/categorias?error=' + encodeURIComponent('No se puede eliminar: tiene productos asociados'));
    }
    const result = await pool.query('DELETE FROM categorias WHERE categoria_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.redirect('/categorias?error=' + encodeURIComponent('Categoría no encontrada'));
    }
    res.redirect('/categorias?success=' + encodeURIComponent('Categoría eliminada correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/categorias?error=' + encodeURIComponent('Error al eliminar categoría'));
  }
};
