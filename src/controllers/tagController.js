

import Etiqueta from '../models/etiqueta.js';


export const listTags = async (req, res) => res.json(await Etiqueta.find());
export const createTag = async (req, res) => res.status(201).json(await Etiqueta.create(req.body));
export const updateTag = async (req, res) => res.json(await Etiqueta.findByIdAndUpdate(req.params.id, req.body, { new:true }));
export const deleteTag = async (req, res) => { await Etiqueta.findByIdAndDelete(req.params.id); res.status(204).end(); };