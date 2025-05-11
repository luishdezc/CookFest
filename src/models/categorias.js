  import { Schema, model } from 'mongoose';

  const categoriaSchema = new Schema({
    tipo : {type: String},
    nombre:  { type: String, required: true, unique: true },
    descripcion : { type: String, required: true, unique: true },
    slug:    { type: String, required: true, unique: true },
    iconoUrl:{ type: String },
  }, { timestamps: false });

  export default model('Categoria', categoriaSchema);
