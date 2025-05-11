

import Receta from '../models/receta.js';

export const getTopRatedRecipes = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const recipes = await Receta.find({ 'valoracion.promedio': { $exists: true } })
      .sort({ 'valoracion.promedio': -1 })
      .limit(parseInt(limit))
      .populate('autor', 'nombre'); 
    
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getMostPopularRecipes = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const recipes = await Receta.aggregate([
      { $addFields: {
        valoracionesTotal: {
          $sum: [
            { $ifNull: ['$valoracion.conteos.5', 0] },
            { $ifNull: ['$valoracion.conteos.4', 0] },
            { $ifNull: ['$valoracion.conteos.3', 0] },
            { $ifNull: ['$valoracion.conteos.2', 0] },
            { $ifNull: ['$valoracion.conteos.1', 0] }
          ]
        }
      }},
      { $sort: { valoracionesTotal: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    await Receta.populate(recipes, { path: 'autor', select: 'nombre' });
    
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};


export const getPopularByCategory = async (req, res, next) => {
  try {
    const { categoria, limit = 3 } = req.params;
    
    if (!categoria) {
      return res.status(400).json({ message: 'Categoría requerida' });
    }
    
    const recipes = await Receta.find({ 
      categorias: { $in: [categoria] } 
    })
    .sort({ 'valoracion.promedio': -1 })
    .limit(parseInt(limit))
    .populate('autor', 'nombre');
    
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};


export const getFeaturedRecipes = async (req, res, next) => {
  try {
    const topRated = await Receta.find({ 'valoracion.promedio': { $gte: 4.5 } })
      .sort({ 'valoracion.promedio': -1 })
      .limit(6)
      .populate('autor', 'nombre');
      
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const latest = await Receta.find({ 
      createdAt: { $gte: twoWeeksAgo }
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('autor', 'nombre');
    
    const combinedRecipes = [...topRated];
    
    latest.forEach(recipe => {
      if (!combinedRecipes.some(r => r._id.toString() === recipe._id.toString())) {
        combinedRecipes.push(recipe);
      }
    });
    
    const featured = combinedRecipes.slice(0, 8);
    
    res.json(featured);
  } catch (error) {
    next(error);
  }
};

export const getRecipeOfTheDay = async (req, res, next) => {
  try {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const goodRecipes = await Receta.find({ 'valoracion.promedio': { $gte: 4 } })
      .populate('autor', 'nombre');
    
    if (!goodRecipes.length) {
      return res.status(404).json({ message: 'No hay recetas disponibles' });
    }
    
    const selectedIndex = seed % goodRecipes.length;
    const recipeOfTheDay = goodRecipes[selectedIndex];
    
    res.json(recipeOfTheDay);
  } catch (error) {
    next(error);
  }
};