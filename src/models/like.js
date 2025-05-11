import { Schema, model, Types } from 'mongoose';

const likeSchema = new Schema({
  usuarioId: { 
    type: Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  recetaId: { 
    type: Types.ObjectId, 
    ref: 'Receta', 
    required: true 
  }
}, { 
  timestamps: true 
});

likeSchema.index({ usuarioId: 1, recetaId: 1 }, { unique: true });

export default model('Like', likeSchema);