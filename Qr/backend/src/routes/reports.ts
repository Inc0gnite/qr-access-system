// Rutas de reportes — solo admin
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { attendance, exportReport } from '../controllers/reportsController';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/attendance', attendance);
router.get('/export', exportReport);

export default router;
