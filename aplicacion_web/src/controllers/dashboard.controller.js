import { pool } from '../config/db.js';

export const mostrarDashboard = async (req, res) => {
  try {
    const [totalProductosRes, stockBajoRes, valorInventarioRes, movimientosRes, chartDataRes, topCategoriasRes] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM productos'),
      pool.query('SELECT COUNT(*) as count FROM productos WHERE stock_actual <= stock_minimo'),
      pool.query('SELECT COALESCE(SUM(precio_unitario * stock_actual), 0) as total FROM productos'),
      pool.query(`
        SELECT m.*, p.nombre as producto_nombre, m.tipo
        FROM movimientos_inventario m
        LEFT JOIN productos p ON m.producto_id = p.producto_id
        ORDER BY m.fecha DESC LIMIT 10
      `),
      pool.query(`
        SELECT DATE(fecha) as dia, tipo, SUM(cantidad) as total
        FROM movimientos_inventario
        WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(fecha), tipo
        ORDER BY dia
      `),
      pool.query(`
        SELECT c.nombre, COALESCE(SUM(p.precio_unitario * p.stock_actual), 0) as valor
        FROM categorias c
        LEFT JOIN productos p ON c.categoria_id = p.categoria_id
        GROUP BY c.categoria_id, c.nombre
        ORDER BY valor DESC
        LIMIT 5
      `)
    ]);

    const totalProductos = totalProductosRes.rows[0]?.count || 0;
    const stockBajo = stockBajoRes.rows[0]?.count || 0;
    const valorInventario = valorInventarioRes.rows[0]?.total || 0;
    const movimientos = movimientosRes.rows;
    const topCategorias = topCategoriasRes.rows;

    const chartByDay = {};
    const hoy = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      chartByDay[key] = { entradas: 0, salidas: 0 };
    }
    chartDataRes.rows.forEach(r => {
      let key = null;
      if (r.dia) {
        const d = typeof r.dia === 'string' ? r.dia.substring(0, 10) : new Date(r.dia).toISOString().split('T')[0];
        key = d;
      }
      if (key && chartByDay[key]) {
        if (r.tipo === 'entrada') chartByDay[key].entradas = parseFloat(r.total) || 0;
        else chartByDay[key].salidas = parseFloat(r.total) || 0;
      }
    });

    const labels = Object.keys(chartByDay).sort();
    const labelsShort = labels.map(l => {
      const [y, m, d] = l.split('-');
      return d + '/' + m;
    });
    const entradasData = labels.map(l => chartByDay[l].entradas);
    const salidasData = labels.map(l => chartByDay[l].salidas);

    res.render('dashboard/index', {
      title: 'Panel Principal',
      totalProductos,
      stockBajo,
      valorInventario,
      movimientos,
      topCategorias,
      chartLabels: labelsShort,
      chartEntradas: entradasData,
      chartSalidas: salidasData
    });
  } catch (error) {
    console.error(error);
    res.send('Error cargando dashboard');
  }
};
