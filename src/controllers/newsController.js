
import News from '../models/news.js';

export const listNews = async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
};

export const getNewsById = async (req, res) => {
  const item = await News.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Noticia no encontrada' });
  res.json(item);
};

export const createNews = async (req, res) => {
  const data = (({ imageUrl, title, intro, headline, description }) => 
    ({ imageUrl, title, intro, headline, description }))(req.body);
  const news = await News.create(data);
  res.status(201).json(news);
};

export const updateNews = async (req, res) => {
  const updated = await News.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ message: 'Noticia no encontrada' });
  res.json(updated);
};

export const deleteNews = async (req, res) => {
  const deleted = await News.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Noticia no encontrada' });
  res.json({ message: 'Eliminada correctamente' });
};
