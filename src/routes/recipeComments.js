

import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as commentCtrl from '../controllers/recipeCommentController.js';

const router = Router();

router.get('/recipes/:recetaId/comments', commentCtrl.getCommentsByRecipe);

router.post('/recipes/:recetaId/comments', authenticate, commentCtrl.createComment);

router.get('/recipe-comments/:commentId', commentCtrl.getComment);

router.put('/recipe-comments/:commentId', authenticate, commentCtrl.updateComment);

router.delete('/recipe-comments/:commentId', authenticate, commentCtrl.deleteComment);

export default router;