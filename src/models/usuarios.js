

import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
  nombre:           { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  passwordHash:     { type: String, required: true },
  fechaNacimiento:  { type: Date },
  avatarUrl:        { type: String },
  isAdmin:          { type: Boolean, default: false},
}, { timestamps: true });

export default model('Usuario', usuarioSchema);