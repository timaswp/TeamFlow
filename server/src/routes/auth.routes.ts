import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), controller.register);
authRouter.post('/login', validateBody(loginSchema), controller.login);
authRouter.get('/me', authenticate, controller.me);
