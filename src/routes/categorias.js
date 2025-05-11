
import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as ctrlCat from '../controllers/categoryController.js';
const rCategories = Router();


rCategories.get('/', ctrlCat.listCategorias);
rCategories.post('/', authenticate, authorizeAdmin, ctrlCat.createCategorias);
rCategories.put('/:id', authenticate, authorizeAdmin, ctrlCat.updateCategorias);
rCategories.delete('/:id', authenticate, authorizeAdmin, ctrlCat.deleteCategorias);
export default rCategories;