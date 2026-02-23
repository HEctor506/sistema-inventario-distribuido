import { Router } from 'express';
import {
  listarCategorias,
  mostrarFormCrear,
  crearCategoria,
  mostrarFormEditar,
  actualizarCategoria,
  eliminarCategoria
} from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', listarCategorias);
router.get('/crear', mostrarFormCrear);
router.post('/', crearCategoria);
router.get('/editar/:id', mostrarFormEditar);
router.post('/editar/:id', actualizarCategoria);
router.post('/eliminar/:id', eliminarCategoria);

export default router;
