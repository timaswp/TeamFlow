import { Router } from 'express';
import * as controller from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  addMemberSchema,
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema';
import { createTaskSchema } from '../schemas/task.schema';

export const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter.get('/', controller.list);
projectRouter.post('/', validateBody(createProjectSchema), controller.create);
projectRouter.get('/:id', controller.detail);
projectRouter.put('/:id', validateBody(updateProjectSchema), controller.update);
projectRouter.delete('/:id', controller.remove);

projectRouter.get('/:id/members', controller.listMembers);
projectRouter.post('/:id/members', validateBody(addMemberSchema), controller.addMember);
projectRouter.delete('/:id/members/:userId', controller.removeMember);

projectRouter.get('/:id/tasks', controller.listTasks);
projectRouter.post('/:id/tasks', validateBody(createTaskSchema), controller.createTask);
