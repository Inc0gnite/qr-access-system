// Rutas de puertas — GET básico para Fase 4 (CRUD completo en Fase 8)
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { list } from '../controllers/doorsController';

const router = Router();

router.use(authenticate);

// GET /api/doors — lista puertas activas
router.get('/', list);

export default router;
