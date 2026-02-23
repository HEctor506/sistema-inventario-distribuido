import express from 'express';
import pool from '../db.js';

const router = express.Router();

/* 1 Productos con stock bajo */
router.get('/stock-bajo', async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM productos
    WHERE stock_actual <= stock_minimo
    ORDER BY stock_actual ASC
  `);
  res.json(result.rows);
});

/* 2 Top 10 más movidos */
router.get('/top-movidos', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  const result = await pool.query(`
    SELECT p.nombre, SUM(m.cantidad) total_salidas
    FROM movimientos_inventario m
    JOIN productos p ON p.producto_id = m.producto_id
    WHERE m.tipo='salida'
    AND m.fecha BETWEEN $1 AND $2
    GROUP BY p.nombre
    ORDER BY total_salidas DESC
    LIMIT 10
  `,[fecha_inicio,fecha_fin]);
  res.json(result.rows);
});

/* 3 Valor inventario */
router.get('/valor-inventario', async (req, res) => {
  const result = await pool.query(`
    SELECT c.nombre categoria,
           SUM(p.precio_unitario*p.stock_actual) valor_total
    FROM productos p
    JOIN categorias c ON c.categoria_id=p.categoria_id
    GROUP BY c.nombre
  `);
  res.json(result.rows);
});

/* 4 Movimientos por fecha */
router.get('/movimientos', async (req,res)=>{
  const {fecha_inicio,fecha_fin}=req.query;
  const result=await pool.query(`
    SELECT * FROM movimientos_inventario
    WHERE fecha BETWEEN $1 AND $2
    ORDER BY fecha DESC
  `,[fecha_inicio,fecha_fin]);
  res.json(result.rows);
});

/* 5 Resumen proveedor */
router.get('/resumen-proveedor', async (req,res)=>{
  const result=await pool.query(`
    SELECT pr.nombre,
           COUNT(p.producto_id) total_productos,
           SUM(p.precio_unitario*p.stock_actual) valor_total
    FROM proveedores pr
    LEFT JOIN productos p ON p.proveedor_id=pr.proveedor_id
    GROUP BY pr.nombre
  `);
  res.json(result.rows);
});

export default router;