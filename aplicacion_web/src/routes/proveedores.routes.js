import { Router } from 'express';
import {
  listarProveedores,
  mostrarFormCrear,
  crearProveedor,
  mostrarFormEditar,
  actualizarProveedor,
  eliminarProveedor
} from '../controllers/proveedores.controller.js';

const router = Router();

router.get('/', listarProveedores);
router.get('/crear', mostrarFormCrear);
router.post('/', crearProveedor);
router.get('/editar/:id', mostrarFormEditar);
router.post('/editar/:id', actualizarProveedor);
router.post('/eliminar/:id', eliminarProveedor);

export default router;
