
import Recent from '../models/recent.js';
import Receta from '../models/receta.js';


export const listRecents = async (req, res) => {
  const { platillo } = req.query;
  try {
    if (platillo) {
      const recetas = await Receta.find({ etiquetas: platillo });
      return res.json(recetas);
    }
    const recents = await Recent.find().sort({ createdAt: -1 });
    return res.json(recents);
  } catch (err) {
    console.error('listRecents error:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const addRecent = async (req, res) => {
  const { platillo } = req.body;
  try {
    const recent = await Recent.create({ platillo });
    return res.status(201).json(recent);
  } catch (err) {
    console.error('addRecent error:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getRecentById = async (req, res) => {
  try {
    const recent = await Recent.findById(req.params.id);
    if (!recent) return res.status(404).json({ message: 'No encontrado' });
    return res.json(recent);
  } catch (err) {
    console.error('getRecentById error:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateRecent = async (req, res) => {
  const { platillo } = req.body;
  try {
    const updated = await Recent.findByIdAndUpdate(
      req.params.id,
      { platillo },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    return res.json(updated);
  } catch (err) {
    console.error('updateRecent error:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const deleteRecent = async (req, res) => {
  try {
    const deleted = await Recent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'No encontrado' });
    return res.status(204).end();
  } catch (err) {
    console.error('deleteRecent error:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};