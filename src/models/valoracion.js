
import { Schema, model, Types } from 'mongoose';

const valoracionSchema = new Schema({
  usuarioId: { type: Types.ObjectId, ref: 'Usuario', required: true },
  recetaId: { type: Types.ObjectId, ref: 'Receta', required: true },
  puntuacion: { type: Number, required: true, min: 1, max: 5 },
  comentario: { type: String },
  esLike: { type: Boolean, default: false } 
}, { timestamps: true });


valoracionSchema.index({ usuarioId: 1, recetaId: 1 }, { unique: true });

export default model('Valoracion', valoracionSchema);