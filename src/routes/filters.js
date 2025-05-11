

import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as ctrlFilters from '../controllers/filtrosController.js';
const rFilters = Router();


rFilters.get('/', ctrlFilters.listFilters);
rFilters.post('/', authenticate, authorizeAdmin, ctrlFilters.createFilters);
rFilters.put('/:id', authenticate, authorizeAdmin, ctrlFilters.updateFilters);
rFilters.delete('/:id', authenticate, authorizeAdmin, ctrlFilters.deleteFilters);
export default rFilters;