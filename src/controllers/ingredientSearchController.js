

import Receta from '../models/receta.js';

export const searchByIngredients = async (req, res, next) => {
  try {
    const { include, exclude, limit = 10, page = 1 } = req.query;
    
    if (!include || include.trim() === '') {
      return res.status(400).json({ 
        message: 'Se requiere al menos un ingrediente para la búsqueda' 
      });
    }

    const includeIngredients = include.split(',').map(ing => ing.trim().toLowerCase());
    
    const excludeIngredients = exclude 
      ? exclude.split(',').map(ing => ing.trim().toLowerCase()) 
      : [];

    const query = {};
    
    if (includeIngredients.length > 0) {
      const includeConditions = includeIngredients.map(ingredient => ({
        ingredientes: { 
          $regex: ingredient, 
          $options: 'i' 
        }
      }));
      
      query.$and = includeConditions;
    }
    
    if (excludeIngredients.length > 0) {
      if (!query.$and) {
        query.$and = [];
      }
      
      excludeIngredients.forEach(ingredient => {
        query.$and.push({
          ingredientes: { 
            $not: { 
              $regex: ingredient, 
              $options: 'i' 
            } 
          }
        });
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const recipes = await Receta.find(query)
      .sort({ 'valoracion.promedio': -1 }) 
      .skip(skip)
      .limit(parseInt(limit))
      .populate('autor', 'nombre');
    
    const total = await Receta.countDocuments(query);
    
    res.json({
      results: recipes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        include: includeIngredients,
        exclude: excludeIngredients
      }
    });
    
  } catch (error) {
    next(error);
  }
};


export const getIngredientSuggestions = async (req, res, next) => {
  try {
    const { term, limit = 10 } = req.query;
    
    if (!term || term.trim() === '') {
      return res.status(400).json({ 
        message: 'Se requiere un término de búsqueda' 
      });
    }
    
    const results = await Receta.aggregate([
      { $unwind: '$ingredientes' },
      { 
        $match: { 
          ingredientes: { 
            $regex: term, 
            $options: 'i' 
          } 
        } 
      },
      { 
        $group: { 
          _id: { $toLower: '$ingredientes' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      { 
        $project: { 
          _id: 0, 
          ingrediente: '$_id', 
          count: 1 
        } 
      }
    ]);
    
    res.json(results);
    
  } catch (error) {
    next(error);
  }
};