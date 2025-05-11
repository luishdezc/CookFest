

import { Schema, model } from 'mongoose';

const etiquetaSchema = new Schema({
  nombre:  { type: String, required: true, unique: true },
  slug:    { type: String, required: true, unique: true },
  iconoUrl:{ type: String },
}, { timestamps: false });

export default model('Etiqueta', etiquetaSchema);
