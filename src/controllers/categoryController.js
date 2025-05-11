
import Categoria from '../models/categorias.js';

export const listCategorias = async (req, res) => res.json(await Categoria.find());
export const createCategorias = async (req, res) => res.status(201).json(await Categoria.create(req.body));
export const updateCategorias = async (req, res) => res.json(await Categoria.findByIdAndUpdate(req.params.id, req.body, { new:true }));
export const deleteCategorias = async (req, res) => { await Categoria.findByIdAndDelete(req.params.id); res.status(204).end(); };