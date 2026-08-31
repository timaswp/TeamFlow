import { Router } from 'express';
import { authRouter } from './auth.routes';
import { projectRouter } from './project.routes';
import { taskRouter } from './task.routes';
import * as commentController from '../controllers/comment.controller';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.get('/dashboard', authenticate, taskController.dashboard);
apiRouter.delete('/comments/:id', authenticate, commentController.remove);
