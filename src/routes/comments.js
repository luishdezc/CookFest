import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as ctrlCom from '../controllers/communityController.js';
const rComments = Router();

rComments.get('/publications/:id/comments', ctrlCom.listComments);
rComments.post('/publications/:id/comments', authenticate, ctrlCom.postComment);

rComments.put('/comments/:id', authenticate, authorizeAdmin, ctrlCom.updateComment);
rComments.delete('/comments/:id', authenticate, authorizeAdmin, ctrlCom.deleteComment);

export default rComments;