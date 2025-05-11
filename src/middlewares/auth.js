

import jwt from 'jsonwebtoken';
import Config from '../config/config.js';
import Usuario from '../models/usuarios.js';
export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Sin token' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, Config.SECRET);
    const user = await Usuario.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};
export const authorizeAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Sin permisos' });
  next();
};