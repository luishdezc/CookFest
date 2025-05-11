


import Filtro from '../models/filtros.js';


export const listFilters = async (req, res) => res.json(await Filtro.find());
export const createFilters = async (req, res) => res.status(201).json(await Filtro.create(req.body));
export const updateFilters = async (req, res) => res.json(await Filtro.findByIdAndUpdate(req.params.id, req.body, { new:true }));
export const deleteFilters = async (req, res) => { await Filtro.findByIdAndDelete(req.params.id); res.status(204).end(); };