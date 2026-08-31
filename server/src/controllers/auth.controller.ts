import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { requireUser } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(requireUser(req));
});
