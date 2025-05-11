

import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as ctrlTag from '../controllers/tagController.js';
const rTags = Router();

rTags.get('/', ctrlTag.listTags);

rTags.post('/', authenticate, authorizeAdmin, ctrlTag.createTag);
rTags.put('/:id', authenticate, authorizeAdmin, ctrlTag.updateTag);
rTags.delete('/:id', authenticate, authorizeAdmin, ctrlTag.deleteTag);

export default rTags;