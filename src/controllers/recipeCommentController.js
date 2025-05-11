

import RecipeComment from '../models/recipeComment.js';
import Receta from '../models/receta.js';
import mongoose from 'mongoose';


export const createComment = async (req, res, next) => {
  try {
    const { recetaId } = req.params;
    const { texto, valoracion, parentId } = req.body;
    
    const receta = await Receta.findById(recetaId);
    if (!receta) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }
    
    if (!texto || texto.trim() === '') {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }
    
    if (valoracion !== undefined && valoracion !== null) {
      if (valoracion < 1 || valoracion > 5) {
        return res.status(400).json({ message: 'La valoración debe estar entre 1 y 5' });
      }
    }
    
    if (parentId) {
      const parentComment = await RecipeComment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Comentario padre no encontrado' });
      }
      if (parentComment.recetaId.toString() !== recetaId) {
        return res.status(400).json({ message: 'El comentario padre no pertenece a esta receta' });
      }
    }
    
    const comment = await RecipeComment.create({
      recetaId,
      autor: req.user._id,
      texto,
      valoracion: valoracion || null,
      parentId: parentId || null
    });
    
    if (valoracion) {
      const allRatings = await RecipeComment.find({ 
        recetaId, 
        valoracion: { $ne: null } 
      });
      
      const totalRatings = allRatings.length;
      const ratingSum = allRatings.reduce((sum, comment) => sum + comment.valoracion, 0);
      const newAverage = ratingSum / totalRatings;
      
      const ratingCounts = {
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0
      };
      
      allRatings.forEach(rating => {
        ratingCounts[rating.valoracion.toString()]++;
      });
      
      await Receta.findByIdAndUpdate(recetaId, {
        'valoracion.promedio': newAverage,
        'valoracion.conteos': ratingCounts
      });
    }
    
    await comment.populate('autor', 'nombre');
    
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};


export const getCommentsByRecipe = async (req, res, next) => {
  try {
    const { recetaId } = req.params;
    const { page = 1, limit = 10, includeReplies = true } = req.query;
    
    const receta = await Receta.findById(recetaId);
    if (!receta) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }
    
    const query = { recetaId };
    
    if (includeReplies === 'false') {
      query.parentId = null;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const comments = await RecipeComment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('autor', 'nombre');
    
    const total = await RecipeComment.countDocuments(query);
    
    let formattedComments = comments;
    
    if (includeReplies === 'true') {
      const parentComments = comments.filter(c => !c.parentId);
      const repliesMap = {};
      
      comments.filter(c => c.parentId).forEach(reply => {
        const parentId = reply.parentId.toString();
        if (!repliesMap[parentId]) {
          repliesMap[parentId] = [];
        }
        repliesMap[parentId].push(reply);
      });
      
      formattedComments = parentComments.map(comment => {
        const commentObj = comment.toObject();
        commentObj.replies = repliesMap[comment._id.toString()] || [];
        return commentObj;
      });
    }
    
    res.json({
      comments: formattedComments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};


export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { texto, valoracion } = req.body;
    
    const comment = await RecipeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    if (comment.autor.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para editar este comentario' });
    }
    
    if (texto !== undefined && texto.trim() !== '') {
      comment.texto = texto;
    }
    
    if (valoracion !== undefined && comment.autor.toString() === req.user._id.toString()) {
      if (valoracion < 1 || valoracion > 5) {
        return res.status(400).json({ message: 'La valoración debe estar entre 1 y 5' });
      }
      
      const oldRating = comment.valoracion;
      comment.valoracion = valoracion;
      
      if (oldRating !== valoracion) {
        const allRatings = await RecipeComment.find({ 
          recetaId: comment.recetaId, 
          valoracion: { $ne: null } 
        });
        
        const totalRatings = allRatings.length;
        const ratingSum = allRatings.reduce((sum, c) => {
          if (c._id.toString() === commentId) {
            return sum + valoracion;
          }
          return sum + c.valoracion;
        }, 0);
        const newAverage = ratingSum / totalRatings;
        
        const ratingCounts = {
          "5": 0,
          "4": 0,
          "3": 0,
          "2": 0,
          "1": 0
        };
        
        allRatings.forEach(r => {
          if (r._id.toString() === commentId) {
            ratingCounts[valoracion.toString()]++;
          } else {
            ratingCounts[r.valoracion.toString()]++;
          }
        });
        
        await Receta.findByIdAndUpdate(comment.recetaId, {
          'valoracion.promedio': newAverage,
          'valoracion.conteos': ratingCounts
        });
      }
    }
    
    await comment.save();
    
    await comment.populate('autor', 'nombre');
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { commentId } = req.params;
    
    const comment = await RecipeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    if (comment.autor.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
    }
    
    const hadRating = comment.valoracion !== null;
    const recetaId = comment.recetaId;
    
    await RecipeComment.findByIdAndDelete(commentId, { session });
    
    await RecipeComment.deleteMany({ parentId: commentId }, { session });
    
    if (hadRating) {
      const allRatings = await RecipeComment.find({ 
        recetaId, 
        valoracion: { $ne: null } 
      }, null, { session });
      
      const totalRatings = allRatings.length;
      let newAverage = 0;
      
      const ratingCounts = {
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0
      };
      
      if (totalRatings > 0) {
        const ratingSum = allRatings.reduce((sum, r) => sum + r.valoracion, 0);
        newAverage = ratingSum / totalRatings;
        
        allRatings.forEach(r => {
          ratingCounts[r.valoracion.toString()]++;
        });
      }
      
      await Receta.findByIdAndUpdate(recetaId, {
        'valoracion.promedio': newAverage,
        'valoracion.conteos': ratingCounts
      }, { session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(204).end();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    const comment = await RecipeComment.findById(commentId)
      .populate('autor', 'nombre');
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
};