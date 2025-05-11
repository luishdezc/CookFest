

import { Router } from 'express';
import * as filterCtrl from '../controllers/recipeFilterController.js';

const router = Router();

router.get('/filter', filterCtrl.filterRecipes);

router.get('/filter-options', filterCtrl.getFilterOptions);

export default router;