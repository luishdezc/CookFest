

import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  imageUrl:     { type: String, required: true },
  title:        { type: String, required: true },
  intro:        { type: String, required: true },
  headline:     { type: String, required: true },
  description:  { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('News', NewsSchema);