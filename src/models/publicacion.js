

import { Schema, model, Types } from 'mongoose';

const publicacionSchema = new Schema({
  autor:     { type: Types.ObjectId, ref: 'Usuario', required: true },
  recetaId:   { type: Types.ObjectId, ref: 'Receta',  required: true },
  titulo:    { type: String },
  texto:     { type: String, required: true },
  imagenUrl: { type: String },
  likes : {type : Number, default : 0},
  usuariosLike: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }]
}, { timestamps: true });

export default model('Publicacion', publicacionSchema);
