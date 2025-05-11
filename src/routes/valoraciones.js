
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as ctrlVal from '../controllers/valoracionController.js';

const router = Router();


router.post('/recipes/:id/like', authenticate, ctrlVal.likeReceta);

router.post('/recipes/:id/rate', authenticate, ctrlVal.valorarReceta);

router.get('/recipes/:id/ratings', ctrlVal.getValoracionesReceta);

router.get('/users/me/ratings', authenticate, ctrlVal.getMisValoraciones);

export default router;