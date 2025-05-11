
import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
const rAuth = Router();
rAuth.post('/register', ctrl.register);
rAuth.post('/login', ctrl.login);
rAuth.post('/logout', authenticate, ctrl.logout);
export default rAuth;