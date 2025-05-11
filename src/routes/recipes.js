

import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as ctrl from '../controllers/recipeController.js';
import * as ingredientCtrl from '../controllers/ingredientSearchController.js';
import mongoose from 'mongoose';

const rRecipes = Router();

rRecipes.get('/my-recipes', authenticate, ctrl.getUserRecipes);


rRecipes.get('/user', (req, res) => {
  console.log('Interceptando solicitud a /api/recipes/user en la ruta específica');
  return res.status(400).json({ 
    message: 'Ruta incorrecta. Para acceder a tus recetas, usa /api/recipes/my-recipes'
  });
});

rRecipes.get('/search', ctrl.searchByIngredients);

rRecipes.get('/', ctrl.listRecipes);

rRecipes.post('/', authenticate, ctrl.createRecipe);


const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (id === 'user') {
    console.log('Interceptando solicitud a /api/recipes/user en middleware');
    return res.status(400).json({ 
      message: 'Ruta incorrecta. Para acceder a tus recetas, usa /api/recipes/my-recipes'
    });
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de receta inválido' });
  }
  
  next();
};


rRecipes.get('/:id', validateObjectId, ctrl.getRecipe);

rRecipes.put('/:id', validateObjectId, authenticate, authorizeAdmin, ctrl.updateRecipe);
rRecipes.delete('/:id', validateObjectId, authenticate, authorizeAdmin, ctrl.deleteRecipe);

rRecipes.post('/:id/valorar', validateObjectId, ctrl.rateRecipe);

export default rRecipes;