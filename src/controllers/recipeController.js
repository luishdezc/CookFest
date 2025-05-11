

import Receta from '../models/receta.js';
import mongoose from 'mongoose';

export const listRecipes = async (req, res) => {
  const { titulo, etiqueta, ingrediente, page=1, limit=10 } = req.query;
  const f = {};
  if (titulo) f.titulo = new RegExp(titulo,'i');
  if (etiqueta) f.etiquetas = etiqueta;
  if (ingrediente) f.ingredientes = ingrediente;
  
  try {
    const recipes = await Receta.find(f).skip((page-1)*limit).limit(+limit).populate('autor', 'nombre');
    res.json(recipes);
  } catch (error) {
    console.error('Error en listRecipes:', error);
    res.status(500).json({ message: 'Error al listar recetas' });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const data = { ...req.body, autor: req.user._id };
    const rec = await Receta.create(data);
    res.status(201).json(rec);
  } catch (error) {
    console.error('Error en createRecipe:', error);
    res.status(500).json({ message: 'Error al crear receta' });
  }
};

export const getRecipe = async (req, res) => {
  console.log('======= DEBUG getRecipe =======');
  console.log('Parámetros:', req.params);
  console.log('ID solicitado:', req.params.id);
  console.log('Referrer:', req.headers.referer || 'No referrer');
  console.log('============================');
  
  try {
    const rec = await Receta.findById(req.params.id).populate('autor', 'nombre email');
    if (!rec) return res.status(404).json({ message: 'Receta no encontrada' });
    res.json(rec);
  } catch (error) {
    console.error('Error en getRecipe:', error);
    res.status(500).json({ message: 'Error al obtener receta' });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const rec = await Receta.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'No existe la receta' });
    
    Object.assign(rec, req.body);
    await rec.save();
    res.json(rec);
  } catch (error) {
    console.error('Error en updateRecipe:', error);
    res.status(500).json({ message: 'Error al actualizar receta' });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    await Receta.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error en deleteRecipe:', error);
    res.status(500).json({ message: 'Error al eliminar receta' });
  }
};

export const searchByIngredients = async (req, res, next) => {
  try {
    const { include, exclude } = req.query;

    const includeArr = include
      ? include.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const excludeArr = exclude
      ? exclude.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (includeArr.length < 1 && excludeArr.length < 1) {
      return res.status(400).json({ message: 'Debes pasar al menos include o exclude' });
    }
    if (includeArr.length > 5 || excludeArr.length > 5) {
      return res.status(400).json({ message: 'Máximo 5 ingredientes en include/exclude' });
    }

    const filter = {};
    if (includeArr.length) filter.ingredientes = { $all: includeArr };
    if (excludeArr.length)  filter.ingredientes = { 
      ...(filter.ingredientes || {}), 
      $nin: excludeArr 
    };

    const results = await Receta.find(filter);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export const rateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { estrellas } = req.body;

    if (![1, 2, 3, 4, 5].includes(estrellas)) {
      return res.status(400).json({ message: 'Calificación inválida' });
    }

    const receta = await Receta.findById(id);
    if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

    receta.valoracion.conteos[estrellas]++;
    const total =
      receta.valoracion.conteos["1"] +
      receta.valoracion.conteos["2"] +
      receta.valoracion.conteos["3"] +
      receta.valoracion.conteos["4"] +
      receta.valoracion.conteos["5"];

    const promedio =
      (1 * receta.valoracion.conteos["1"] +
       2 * receta.valoracion.conteos["2"] +
       3 * receta.valoracion.conteos["3"] +
       4 * receta.valoracion.conteos["4"] +
       5 * receta.valoracion.conteos["5"]) / total;

    receta.valoracion.promedio = promedio.toFixed(2);
    await receta.save();

    res.json({ promedio: receta.valoracion.promedio, conteos: receta.valoracion.conteos });
  } catch (error) {
    console.error('Error en rateRecipe:', error);
    res.status(500).json({ message: 'Error al valorar receta' });
  }
};

export const getUserRecipes = async (req, res) => {
  try {
    const userRecipes = await Receta.find({ autor: req.user._id })
      .sort({ createdAt: -1 })
      .populate('autor', 'nombre');
    
    res.json(userRecipes);
  } catch (error) {
    console.error('Error en getUserRecipes:', error);
    res.status(500).json({ message: 'Error al obtener recetas del usuario' });
  }
};
