
import { Schema, model } from 'mongoose';

const filtroSchema = new Schema({
  nombre:  { type: String, required: true, unique: true },
}, { timestamps: false });

export default model('Filtro', filtroSchema);