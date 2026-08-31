import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as commentsApi from '@/api/comments';

export const commentKeys = {
  byTask: (taskId: string) => ['tasks', taskId, 'comments'] as const,
};

export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.byTask(taskId),
    queryFn: () => commentsApi.listComments(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => commentsApi.createComment(taskId, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) }),
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commentsApi.deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) }),
  });
}
