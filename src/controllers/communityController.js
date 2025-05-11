
import Publicacion from '../models/publicacion.js';
import Comentario   from '../models/comentario.js';
import Favorito     from '../models/favorito.js';
import Like         from '../models/like.js';

export const postPublication = async (req, res) => {
  const { titulo, texto, recetaId, imagenUrl } = req.body;
  const pub = await Publicacion.create({
    titulo,
    texto,
    recetaId,
    imagenUrl,
    autor: req.user._id
  });
  res.status(201).json(pub);
};

export const listPublications = async (req, res) => {
  const pubs = await Publicacion.find()
    .populate('autor', 'nombre avatarUrl')          
    .populate('recetaId', 'imagenUrl titulo');       
  res.json(pubs);
};

export const likePublication = async (req, res) => {
  try {
    const publicacionId = req.params.id;
    const usuarioId     = req.user._id.toString();

    const pub = await Publicacion.findById(publicacionId);
    if (!pub) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    if (!Array.isArray(pub.usuariosLike)) {
      pub.usuariosLike = [];
    }

    const hasLiked = pub.usuariosLike.some(uId => uId.toString() === usuarioId);

    if (hasLiked) {
      pub.usuariosLike = pub.usuariosLike.filter(uId => uId.toString() !== usuarioId);
      pub.likes = pub.usuariosLike.length;

      if (pub.recetaId) {
        await Favorito.deleteOne({ usuarioId, recetaId: pub.recetaId });
        await Like.deleteOne({ usuarioId, recetaId: pub.recetaId });
      }

      await pub.save();
      return res.json({
        message: 'Like removido con éxito',
        likes: pub.likes,
        liked: false
      });
    } else {
      pub.usuariosLike.push(usuarioId);
      pub.likes = pub.usuariosLike.length;

      if (pub.recetaId) {
        const fav = await Favorito.findOne({ usuarioId, recetaId: pub.recetaId });
        if (!fav) {
          await Favorito.create({ usuarioId, recetaId: pub.recetaId });
        }

        const lk = await Like.findOne({ usuarioId, recetaId: pub.recetaId });
        if (!lk) {
          await Like.create({ usuarioId, recetaId: pub.recetaId });
        }
      }

      await pub.save();
      return res.json({
        message: 'Like añadido con éxito',
        likes: pub.likes,
        liked: true
      });
    }
  } catch (error) {
    console.error('Error en likePublication:', error);
    return res.status(500).json({ message: 'Error al procesar like' });
  }
};

export const updatePublication = async (req, res) =>
  res.json(await Publicacion.findByIdAndUpdate(req.params.id, req.body, { new: true }));

export const deletePublication = async (req, res) => {
  await Publicacion.findByIdAndDelete(req.params.id);
  res.status(204).end();
};

export const listComments = async (req, res) => {
  try {
    const comments = await Comentario.find({ publicacionId: req.params.id })
      .populate('autor', 'nombre avatarUrl')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error('Error listando comentarios:', err);
    res.status(500).json({ message: 'Error al listar comentarios' });
  }
};

export const postComment = async (req, res) => {
  try {
    const comment = await Comentario.create({
      publicacionId: req.params.id,
      autor: req.user._id,
      texto: req.body.texto
    });
    await comment.populate('autor', 'nombre avatarUrl');
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creando comentario:', err);
    res.status(500).json({ message: 'Error al crear comentario' });
  }
};

export const updateComment = async (req, res) =>
  res.json(await Comentario.findByIdAndUpdate(req.params.id, req.body, { new: true }));

export const deleteComment = async (req, res) => {
  await Comentario.findByIdAndDelete(req.params.id);
  res.status(204).end();
};