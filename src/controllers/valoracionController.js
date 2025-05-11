
import Valoracion from '../models/valoracion.js';
import Receta from '../models/receta.js';
import Like from '../models/like.js';
import Favorito from '../models/favorito.js';

export const likeReceta = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const usuarioId = req.user._id;

    const receta = await Receta.findById(id);
    if (!receta) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }

    const existingLike = await Like.findOne({ usuarioId, recetaId: id });
    
    const existingFavorite = await Favorito.findOne({ usuarioId, recetaId: id });

    if (existingLike) {
      await Like.deleteOne({ usuarioId, recetaId: id });
      
      if (existingFavorite) {
        await Favorito.deleteOne({ usuarioId, recetaId: id });
      }
      
      await Receta.findByIdAndUpdate(id, { $inc: { likes: -1 } });
      
      return res.status(200).json({ liked: false, count: (receta.likes || 1) - 1 });
    } else {
      await Like.create({ usuarioId, recetaId: id });
      
      if (!existingFavorite) {
        await Favorito.create({ usuarioId, recetaId: id });
      }
      
      await Receta.findByIdAndUpdate(id, { $inc: { likes: 1 } });
      
      return res.status(200).json({ liked: true, count: (receta.likes || 0) + 1 });
    }
  } catch (error) {
    console.error('Error en likeReceta:', error);
    next(error);
  }
};

export const valorarReceta = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { puntuacion, comentario } = req.body;
    const usuarioId = req.user._id;

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ message: 'La puntuación debe estar entre 1 y 5' });
    }

    let valoracion = await Valoracion.findOne({ usuarioId, recetaId: id });
    
    if (valoracion) {
      valoracion.puntuacion = puntuacion;
      if (comentario) valoracion.comentario = comentario;
      valoracion.esLike = true; 
      await valoracion.save();
    } else {
      valoracion = await Valoracion.create({
        usuarioId,
        recetaId: id,
        puntuacion,
        comentario,
        esLike: true 
      });
    }

    const existingLike = await Like.findOne({ usuarioId, recetaId: id });
    if (!existingLike) {
      await Like.create({ usuarioId, recetaId: id });
      await Receta.findByIdAndUpdate(id, { $inc: { likes: 1 } });
    }
    
    const existingFavorite = await Favorito.findOne({ usuarioId, recetaId: id });
    if (!existingFavorite) {
      await Favorito.create({ usuarioId, recetaId: id });
    }

    await actualizarValoracionReceta(id);
    
    res.status(200).json(valoracion);
  } catch (error) {
    next(error);
  }
};

export const getValoracionesReceta = async (req, res, next) => {
  try {
    const { id } = req.params; 
    
    const valoraciones = await Valoracion.find({ recetaId: id, puntuacion: { $gt: 0 } })
      .populate('usuarioId', 'nombre avatarUrl')
      .sort({ createdAt: -1 });
    
    res.status(200).json(valoraciones);
  } catch (error) {
    next(error);
  }
};

export const getMisValoraciones = async (req, res, next) => {
  try {
    const usuarioId = req.user._id;
    
    const valoraciones = await Valoracion.find({ usuarioId })
      .populate('recetaId', 'titulo imagenUrl')
      .sort({ createdAt: -1 });
    
    res.status(200).json(valoraciones);
  } catch (error) {
    next(error);
  }
};

async function actualizarValoracionReceta(recetaId) {
  const valoraciones = await Valoracion.find({ 
    recetaId, 
    puntuacion: { $gt: 0 } 
  });
  
  const conteos = {
    "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
  };
  
  let total = 0;
  
  valoraciones.forEach(val => {
    conteos[val.puntuacion.toString()]++;
    total += val.puntuacion;
  });
  
  const promedio = valoraciones.length > 0 ? total / valoraciones.length : 0;

  await Receta.findByIdAndUpdate(recetaId, {
    valoracion: {
      promedio: Math.round(promedio * 10) / 10, 
      conteos
    }
  });
  
  const likesCount = await Like.countDocuments({ recetaId });
  await Receta.findByIdAndUpdate(recetaId, { likes: likesCount });
}