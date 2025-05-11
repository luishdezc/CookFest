
import mongoose from 'mongoose';

const RecentSchema = new mongoose.Schema({
  platillo: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Recent', RecentSchema);