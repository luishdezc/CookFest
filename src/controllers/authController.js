import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuarios.js';
import Config from '../config/config.js';

export const register = async (req, res) => {
  const {
    nombre,
    email,
    password,
    fechaNacimiento,
    avatarUrl = '',
    isAdmin = false
  } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ message: 'Faltan datos' });

  if (await Usuario.findOne({ email }))
    return res.status(409).json({ message: 'Correo ya existe' });

  const hash = await bcrypt.hash(password, 10);
  const user = await Usuario.create({
    nombre,
    email,
    passwordHash: hash,
    fechaNacimiento,
    avatarUrl,            
    isAdmin
  });

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    Config.SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      avatarUrl: user.avatarUrl,  
      isAdmin: user.isAdmin
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await Usuario.findOne({ email });
  if (!user)
    return res.status(401).json({ message: 'Credenciales inválidas' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match)
    return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    Config.SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      avatarUrl: user.avatarUrl,   
      isAdmin: user.isAdmin
    }
  });
};

export const logout = (req, res) => res.status(204).end();