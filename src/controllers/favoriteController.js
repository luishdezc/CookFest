
import Favorito from '../models/favorito.js';
import Like from '../models/like.js'; 

export const addFavorite = async (req, res, next) => {
  try {
    if (await Favorito.findOne({ usuarioId: req.user._id, recetaId: req.params.id })) {
      return res.status(409).json({ message: 'Ya existe en favoritos' });
    }
    
    await Favorito.create({ usuarioId: req.user._id, recetaId: req.params.id });
    
    if (!(await Like.findOne({ usuarioId: req.user._id, recetaId: req.params.id }))) {
      await Like.create({ usuarioId: req.user._id, recetaId: req.params.id });
    }
    
    res.status(201).end();
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => { 
  try {
    await Favorito.deleteOne({ usuarioId: req.user._id, recetaId: req.params.id }); 
    
    await Like.deleteOne({ usuarioId: req.user._id, recetaId: req.params.id });
    
    res.status(204).end(); 
  } catch (error) {
    next(error);
  }
};

export const listFavorites = async (req, res, next) => {
  try {
    const favs = await Favorito.find({ usuarioId: req.user._id }).populate('recetaId');
    res.json(favs);
  } catch (error) {
    next(error);
  }
};