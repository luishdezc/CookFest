
import { Schema, model, Types } from 'mongoose';

const valoracionSchema = new Schema({
  promedio: { type: Number, default: 0 },
  conteos:  {
    "5": { type: Number, default: 0 },
    "4": { type: Number, default: 0 },
    "3": { type: Number, default: 0 },
    "2": { type: Number, default: 0 },
    "1": { type: Number, default: 0 },
  }
}, { _id: false });

const recetaSchema = new Schema({
  titulo:       { type: String, required: true },
  descripcion:  { type: String },
  autor:        { type: Types.ObjectId, ref: 'Usuario', required: true },
  imagenUrl:    { type: String },
  utensilios:   [String],
  ingredientes: [String],
  porcionesDeIngredientes : [String],
  pasos:        [String],
  porciones:    { type: Number },
  tiempoTotal:  { type: Number }, 
  dificultad:   { type: String },
  costo:        { type: String },
  categorias:   [String],
  etiquetas:    [String],
  likes:        { type: Number, default: 0 }, 
  valoracion:   { type: valoracionSchema, default: () => ({}) },
}, { timestamps: true });

export default model('Receta', recetaSchema);