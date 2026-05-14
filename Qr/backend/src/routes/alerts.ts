// Rutas de alertas — solo accesibles para admin
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { listAlerts, markAsRead, markAllAsRead } from '../controllers/alertsController';

const router = Router();

router.use(authenticate, authorize('admin'));

// GET  /api/alerts?leida=false  — lista alertas (filtro opcional por estado)
router.get('/', listAlerts);

// PATCH /api/alerts/read-all    — marca TODAS las no leídas como leídas
// IMPORTANTE: esta ruta debe ir antes de /:id/read para que Express no la trate como un id
router.patch('/read-all', markAllAsRead);

// PATCH /api/alerts/:id/read    — marca una alerta como leída
router.patch('/:id/read', markAsRead);

export default router;
