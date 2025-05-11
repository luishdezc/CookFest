

import { Schema, model, Types } from 'mongoose';

const favoritoSchema = new Schema({
  usuarioId: { type: Types.ObjectId, ref: 'Usuario', required: true },
  recetaId:  { type: Types.ObjectId, ref: 'Receta',  required: true },
}, { timestamps: { createdAt: 'addedAt', updatedAt: false } });

export default model('Favorito', favoritoSchema);
