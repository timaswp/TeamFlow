import type { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import * as commentService from '../services/comment.service';
import { requireUser } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

function taskId(req: Request): string {
  const value = req.params.id;
  if (!value) {
    throw new BadRequestError('Missing task id');
  }
  return value;
}

export const detail = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.getTask(taskId(req), requireUser(req).id));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.updateTask(taskId(req), requireUser(req).id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(taskId(req), requireUser(req).id);
  res.status(204).send();
});

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  res.json(await commentService.listComments(taskId(req), requireUser(req).id));
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.createComment(
    taskId(req),
    requireUser(req).id,
    req.body.text,
  );
  res.status(201).json(comment);
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.getDashboard(requireUser(req).id));
});
