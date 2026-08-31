import type { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import * as taskService from '../services/task.service';
import { requireUser } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

function param(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`Missing route parameter: ${key}`);
  }
  return value;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await projectService.listProjects(requireUser(req).id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await projectService.createProject(requireUser(req).id, req.body));
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  res.json(await projectService.getProject(param(req, 'id'), requireUser(req).id));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await projectService.updateProject(param(req, 'id'), requireUser(req).id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(param(req, 'id'), requireUser(req).id);
  res.status(204).send();
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  res.json(await projectService.listMembers(param(req, 'id'), requireUser(req).id));
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await projectService.addMember(
    param(req, 'id'),
    requireUser(req).id,
    req.body.email,
  );
  res.status(201).json(member);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await projectService.removeMember(param(req, 'id'), requireUser(req).id, param(req, 'userId'));
  res.status(204).send();
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.listProjectTasks(param(req, 'id'), requireUser(req).id));
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(param(req, 'id'), requireUser(req).id, req.body);
  res.status(201).json(task);
});
