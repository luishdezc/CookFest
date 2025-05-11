

import { Router } from 'express';
import * as ctrl from '../controllers/recentController.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/',      ctrl.listRecents);

router.get('/:id',   ctrl.getRecentById);

router.post('/',     authenticate, authorizeAdmin, ctrl.addRecent);

router.put('/:id',   authenticate, authorizeAdmin, ctrl.updateRecent);

router.delete('/:id',authenticate, authorizeAdmin, ctrl.deleteRecent);

export default router;


