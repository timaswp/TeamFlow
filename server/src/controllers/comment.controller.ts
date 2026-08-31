import type { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { requireUser } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new BadRequestError('Missing comment id');
  }
  await commentService.deleteComment(id, requireUser(req).id);
  res.status(204).send();
});
