

import { Router } from 'express';
import * as ingredientCtrl from '../controllers/ingredientSearchController.js';

const router = Router();

router.get('/search', ingredientCtrl.searchByIngredients);

router.get('/suggestions', ingredientCtrl.getIngredientSuggestions);

export default router;