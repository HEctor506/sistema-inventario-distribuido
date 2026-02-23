import { Router } from 'express';
import {
  listarMovimientos,
  mostrarFormEntrada,
  mostrarFormSalida,
  registrarMovimiento
} from '../controllers/movimientos.controller.js';

const router = Router();

router.get('/', listarMovimientos);
router.get('/entrada', mostrarFormEntrada);
router.get('/salida', mostrarFormSalida);
router.post('/entrada', registrarMovimiento);
router.post('/salida', registrarMovimiento);

export default router;
