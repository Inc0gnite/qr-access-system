// Rutas de personas
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import * as personController from '../controllers/personController';

const router = Router();

// Todos los endpoints requieren autenticación
router.use(authenticate);

// GET /api/persons — listar con filtros opcionales
router.get('/', personController.list);

// GET /api/persons/:id — obtener por id
router.get('/:id', personController.getById);

// GET /api/persons/:id/qr — imagen PNG del QR
router.get('/:id/qr', personController.getQr);

// Los siguientes endpoints solo son accesibles para el rol admin
router.post('/', authorize('admin'), personController.create);
router.put('/:id', authorize('admin'), personController.update);
router.delete('/:id', authorize('admin'), personController.remove);

export default router;
