

import { Schema, model, Types } from 'mongoose';

const comentarioSchema = new Schema({
  publicacionId: { type: Types.ObjectId, ref: 'Publicacion', required: true },
  autor:         { type: Types.ObjectId, ref: 'Usuario',      required: true },
  texto:         { type: String, required: true },
  parentId:      { type: Types.ObjectId, ref: 'Comentario' },
}, { timestamps: true });

export default model('Comentario', comentarioSchema);
