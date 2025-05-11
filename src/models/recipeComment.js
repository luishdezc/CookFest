

import { Schema, model, Types } from 'mongoose';

const recipeCommentSchema = new Schema({
  recetaId: { 
    type: Types.ObjectId, 
    ref: 'Receta', 
    required: true 
  },
  autor: { 
    type: Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  texto: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 1,
    maxlength: 500
  },
  valoracion: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: null
  },
  parentId: { 
    type: Types.ObjectId, 
    ref: 'RecipeComment',
    default: null
  }
}, { 
  timestamps: true 
});


recipeCommentSchema.index({ recetaId: 1, createdAt: -1 });
recipeCommentSchema.index({ autor: 1 });
recipeCommentSchema.index({ parentId: 1 });

export default model('RecipeComment', recipeCommentSchema);