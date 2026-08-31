import { Router } from 'express';
import * as controller from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createCommentSchema, updateTaskSchema } from '../schemas/task.schema';

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get('/:id', controller.detail);
taskRouter.put('/:id', validateBody(updateTaskSchema), controller.update);
taskRouter.delete('/:id', controller.remove);

taskRouter.get('/:id/comments', controller.listComments);
taskRouter.post('/:id/comments', validateBody(createCommentSchema), controller.createComment);
