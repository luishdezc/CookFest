

import { Router } from 'express';
import * as popularCtrl from '../controllers/popularRecipeController.js';

const router = Router();

router.get('/top-rated', popularCtrl.getTopRatedRecipes);

router.get('/most-popular', popularCtrl.getMostPopularRecipes);

router.get('/category/:categoria', popularCtrl.getPopularByCategory);

router.get('/featured', popularCtrl.getFeaturedRecipes);

router.get('/recipe-of-the-day', popularCtrl.getRecipeOfTheDay);

export default router;