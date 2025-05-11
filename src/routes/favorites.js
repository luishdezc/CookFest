

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as ctrlFav from '../controllers/favoriteController.js';
const rFav = Router();

rFav.post('/recipes/:id/favorites', authenticate, ctrlFav.addFavorite);
rFav.delete('/recipes/:id/favorites', authenticate, ctrlFav.removeFavorite);
rFav.get('/users/me/favorites', authenticate, ctrlFav.listFavorites);

export default rFav;