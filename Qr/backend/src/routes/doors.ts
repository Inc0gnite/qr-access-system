// Rutas de puertas — GET abierto a todos los autenticados, CRUD solo admin
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { list, listAll, create, update, toggle, remove } from '../controllers/doorsController';

const router = Router();

router.use(authenticate);

// Todos los usuarios autenticados (scanner necesita la lista de puertas activas)
router.get('/', list);

// Solo admin
router.get('/all', authorize('admin'), listAll);
router.post('/', authorize('admin'), create);
router.put('/:id', authorize('admin'), update);
router.patch('/:id/toggle', authorize('admin'), toggle);
router.delete('/:id', authorize('admin'), remove);

export default router;
