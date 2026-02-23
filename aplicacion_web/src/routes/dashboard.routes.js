import { Router } from 'express';
import { mostrarDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', mostrarDashboard);

export default router;