import { pool } from '../config/db.js';

export const listarProveedores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pr.*, COUNT(p.producto_id) as cantidad_productos
      FROM proveedores pr
      LEFT JOIN productos p ON pr.proveedor_id = p.proveedor_id
      GROUP BY pr.proveedor_id, pr.nombre, pr.contacto, pr.telefono, pr.email, pr.direccion
      ORDER BY pr.nombre
    `);
    res.render('proveedores/lista', {
      proveedores: result.rows,
      title: 'Proveedores',
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.render('proveedores/lista', { proveedores: [], error: 'Error al cargar proveedores' });
  }
};

export const mostrarFormCrear = async (req, res) => {
  res.render('proveedores/form', {
    proveedor: null,
    title: 'Nuevo Proveedor',
    error: req.query.error
  });
};

export const crearProveedor = async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.redirect('/proveedores/crear?error=' + encodeURIComponent('El nombre es obligatorio'));
    }
    await pool.query(
      'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5)',
      [nombre.trim(), contacto?.trim() || null, telefono?.trim() || null, email?.trim() || null, direccion?.trim() || null]
    );
    res.redirect('/proveedores?success=' + encodeURIComponent('Proveedor creado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/proveedores/crear?error=' + encodeURIComponent('Error al crear proveedor'));
  }
};

export const mostrarFormEditar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM proveedores WHERE proveedor_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.redirect('/proveedores?error=' + encodeURIComponent('Proveedor no encontrado'));
    }
    res.render('proveedores/form', {
      proveedor: result.rows[0],
      title: 'Editar Proveedor',
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect('/proveedores?error=' + encodeURIComponent('Error al cargar formulario'));
  }
};

export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, contacto, telefono, email, direccion } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.redirect('/proveedores/editar/' + id + '?error=' + encodeURIComponent('El nombre es obligatorio'));
    }
    const result = await pool.query(
      'UPDATE proveedores SET nombre=$1, contacto=$2, telefono=$3, email=$4, direccion=$5 WHERE proveedor_id=$6',
      [nombre.trim(), contacto?.trim() || null, telefono?.trim() || null, email?.trim() || null, direccion?.trim() || null, id]
    );
    if (result.rowCount === 0) {
      return res.redirect('/proveedores?error=' + encodeURIComponent('Proveedor no encontrado'));
    }
    res.redirect('/proveedores?success=' + encodeURIComponent('Proveedor actualizado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/proveedores?error=' + encodeURIComponent('Error al actualizar proveedor'));
  }
};

export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const countRes = await pool.query('SELECT COUNT(*) FROM productos WHERE proveedor_id = $1', [id]);
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return res.redirect('/proveedores?error=' + encodeURIComponent('No se puede eliminar: tiene productos asociados'));
    }
    const result = await pool.query('DELETE FROM proveedores WHERE proveedor_id = $1', [id]);
    if (result.rowCount === 0) {
      return res.redirect('/proveedores?error=' + encodeURIComponent('Proveedor no encontrado'));
    }
    res.redirect('/proveedores?success=' + encodeURIComponent('Proveedor eliminado correctamente'));
  } catch (error) {
    console.error(error);
    res.redirect('/proveedores?error=' + encodeURIComponent('Error al eliminar proveedor'));
  }
};
