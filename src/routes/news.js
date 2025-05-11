

import { Router } from 'express';
import * as ctrl from '../controllers/newsController.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/',             ctrl.listNews);
router.get('/:id',          ctrl.getNewsById);
router.post('/',            authenticate, authorizeAdmin, ctrl.createNews);
router.put('/:id',          authenticate, authorizeAdmin, ctrl.updateNews);
router.delete('/:id',       authenticate, authorizeAdmin, ctrl.deleteNews);

export default router;