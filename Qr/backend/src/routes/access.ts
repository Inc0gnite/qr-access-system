// Rutas de accesos
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { scan, live, inside } from '../controllers/accessController';

const router = Router();

router.use(authenticate);

// POST /api/access/scan — registra una entrada o salida por QR
router.post('/scan', scan);

// GET /api/access/live — últimas 20 entradas/salidas
router.get('/live', live);

// GET /api/access/inside — personas que están dentro ahora
router.get('/inside', inside);

export default router;
