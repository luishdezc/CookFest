

import Receta from '../models/receta.js';

export const filterRecipes = async (req, res, next) => {
  try {
    const { 
      categoria,
      dificultad,
      tiempoMax,
      tiempoMin,
      costo,
      porciones,
      orderBy = 'valoracion', 
      page = 1,
      limit = 10
    } = req.query;
    
    const filter = {};
    
    if (categoria) {
      const categorias = categoria.split(',').map(cat => cat.trim());
      filter.categorias = { $in: categorias };
    }
    
    if (dificultad) {
      const dificultades = dificultad.split(',').map(d => d.trim());
      filter.dificultad = { $in: dificultades };
    }
    
    if (tiempoMin || tiempoMax) {
      filter.tiempoTotal = {};
      if (tiempoMin) filter.tiempoTotal.$gte = parseInt(tiempoMin);
      if (tiempoMax) filter.tiempoTotal.$lte = parseInt(tiempoMax);
    }
    
    if (costo) {
      const costos = costo.split(',').map(c => c.trim());
      filter.costo = { $in: costos };
    }
    
    if (porciones) {
      filter.porciones = parseInt(porciones);
    }
    
    let sort = {};
    switch(orderBy) {
      case 'tiempo':
        sort = { tiempoTotal: 1 }; 
        break;
      case 'reciente':
        sort = { createdAt: -1 }; 
        break;
      case 'valoracion':
      default:
        sort = { 'valoracion.promedio': -1 }; 
        break;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const recipes = await Receta.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('autor', 'nombre');
    
    const total = await Receta.countDocuments(filter);
    
    res.json({
      results: recipes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        categoria: categoria ? categoria.split(',') : [],
        dificultad: dificultad ? dificultad.split(',') : [],
        tiempoMin: tiempoMin ? parseInt(tiempoMin) : null,
        tiempoMax: tiempoMax ? parseInt(tiempoMax) : null,
        costo: costo ? costo.split(',') : [],
        porciones: porciones ? parseInt(porciones) : null,
        orderBy
      }
    });
    
  } catch (error) {
    next(error);
  }
};

export const getFilterOptions = async (req, res, next) => {
  try {
    const categoriasQuery = await Receta.aggregate([
      { $unwind: '$categorias' },
      { $group: { _id: '$categorias' } },
      { $sort: { _id: 1 } }
    ]);
    const categorias = categoriasQuery.map(item => item._id);
    
    const dificultadesQuery = await Receta.aggregate([
      { $group: { _id: '$dificultad' } },
      { $sort: { _id: 1 } }
    ]);
    const dificultades = dificultadesQuery.map(item => item._id).filter(Boolean);
    
    const tiemposQuery = await Receta.aggregate([
      { $group: { 
        _id: null, 
        minTiempo: { $min: '$tiempoTotal' }, 
        maxTiempo: { $max: '$tiempoTotal' } 
      } }
    ]);
    const tiempos = tiemposQuery.length > 0 ? {
      min: tiemposQuery[0].minTiempo,
      max: tiemposQuery[0].maxTiempo
    } : { min: 0, max: 0 };
    
    const costosQuery = await Receta.aggregate([
      { $group: { _id: '$costo' } },
      { $sort: { _id: 1 } }
    ]);
    const costos = costosQuery.map(item => item._id).filter(Boolean);
    
    const porcionesQuery = await Receta.aggregate([
      { $group: { 
        _id: null, 
        minPorciones: { $min: '$porciones' }, 
        maxPorciones: { $max: '$porciones' } 
      } }
    ]);
    const porciones = porcionesQuery.length > 0 ? {
      min: porcionesQuery[0].minPorciones,
      max: porcionesQuery[0].maxPorciones
    } : { min: 0, max: 0 };
    
    res.json({
      categorias,
      dificultades,
      tiempos,
      costos,
      porciones,
      ordenamiento: ['valoracion', 'tiempo', 'reciente']
    });
    
  } catch (error) {
    next(error);
  }
};