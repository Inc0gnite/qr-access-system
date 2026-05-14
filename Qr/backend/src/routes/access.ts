// Rutas de accesos (escaneo de QR)
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { scan } from '../controllers/accessController';

const router = Router();

router.use(authenticate);

// POST /api/access/scan — registra una entrada o salida por QR
router.post('/scan', scan);

export default router;
