import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import * as ctrlComm from '../controllers/communityController.js';
const rCommunity = Router();

rCommunity.post('/posts', authenticate, ctrlComm.postPublication);
rCommunity.get('/posts', ctrlComm.listPublications);

rCommunity.put('/posts/:id', authenticate, authorizeAdmin, ctrlComm.updatePublication);
rCommunity.delete('/posts/:id', authenticate, authorizeAdmin, ctrlComm.deletePublication);

rCommunity.put('/posts/:id/like', authenticate, ctrlComm.likePublication);


export default rCommunity;