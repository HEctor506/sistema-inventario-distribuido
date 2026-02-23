import { Router } from 'express';
import {
  listarProductos,
  mostrarFormCrear,
  crearProducto,
  mostrarFormEditar,
  actualizarProducto,
  eliminarProducto
} from '../controllers/productos.controller.js';

const router = Router();

router.get('/', listarProductos);
router.get('/crear', mostrarFormCrear);
router.post('/', crearProducto);
router.get('/editar/:id', mostrarFormEditar);
router.post('/editar/:id', actualizarProducto);
router.post('/eliminar/:id', eliminarProducto);

export default router;
