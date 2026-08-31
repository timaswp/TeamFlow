import { api } from './client';
import type { Comment } from '@/types';

export async function listComments(taskId: string): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
  return data;
}

export async function createComment(taskId: string, text: string): Promise<Comment> {
  const { data } = await api.post<Comment>(`/tasks/${taskId}/comments`, { text });
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/comments/${commentId}`);
}
