
import express from 'express';
import { likePublication } from '../controllers/communityController.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.put('/:id/like',   authenticate, likePublication);
router.put('/:id/unlike', authenticate, likePublication);

export default router;
