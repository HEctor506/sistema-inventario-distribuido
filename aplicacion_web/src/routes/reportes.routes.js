import express from 'express';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const hoy = new Date();
    const defaultFin = hoy.toISOString().substring(0, 10);
    const iniDate = new Date(hoy);
    iniDate.setDate(iniDate.getDate() - 30);
    const defaultIni = iniDate.toISOString().substring(0, 10);

    const inicio = fecha_inicio || defaultIni;
    const fin = fecha_fin || defaultFin;

    const base = process.env.REPORT_SERVICE_URL;

    const [
      stockBajoRes,
      topMovidosRes,
      valorInventarioRes,
      movimientosRes,
      resumenProveedorRes
    ] = await Promise.all([
      fetch(`${base}/reportes/stock-bajo`),
      fetch(`${base}/reportes/top-movidos?fecha_inicio=${inicio}&fecha_fin=${fin}`),
      fetch(`${base}/reportes/valor-inventario`),
      fetch(`${base}/reportes/movimientos?fecha_inicio=${inicio}&fecha_fin=${fin}`),
      fetch(`${base}/reportes/resumen-proveedor`)
    ]);

    const [
      stockBajo,
      topMovidos,
      valorInventario,
      movimientos,
      resumenProveedor
    ] = await Promise.all([
      stockBajoRes.json(),
      topMovidosRes.json(),
      valorInventarioRes.json(),
      movimientosRes.json(),
      resumenProveedorRes.json()
    ]);

    let totalMovimientos = 0;
    let totalEntradas = 0;
    let totalSalidas = 0;

    (movimientos || []).forEach(m => {
      const cantidad = Number(m.cantidad) || 0;
      totalMovimientos += cantidad;
      if (m.tipo === 'entrada') totalEntradas += cantidad;
      if (m.tipo === 'salida') totalSalidas += cantidad;
    });

    res.render('reportes/dashboard', {
      title: 'Reportes',
      stockBajo,
      topMovidos,
      valorInventario,
      movimientos,
      resumenProveedor,
      filtros: { fecha_inicio: inicio, fecha_fin: fin },
      totalesMovimientos: {
        totalMovimientos,
        totalEntradas,
        totalSalidas
      }
    });
  } catch (error) {
    console.error(error);
    res.send('Error consumiendo servicio de reportes');
  }
});

export default router;