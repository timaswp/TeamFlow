import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '@/api/tasks';
import { projectKeys } from '@/features/projects/queries';
import type { Task, TaskStatus } from '@/types';

export const taskKeys = {
  byProject: (projectId: string) => ['projects', projectId, 'tasks'] as const,
  detail: (taskId: string) => ['tasks', taskId] as const,
};

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => tasksApi.listProjectTasks(projectId),
    enabled: Boolean(projectId),
  });
}

function useTaskInvalidation(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard });
  };
}

export function useCreateTask(projectId: string) {
  const invalidate = useTaskInvalidation(projectId);
  return useMutation({
    mutationFn: (payload: tasksApi.TaskPayload) => tasksApi.createTask(projectId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(projectId: string) {
  const invalidate = useTaskInvalidation(projectId);
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Partial<tasksApi.TaskPayload> }) =>
      tasksApi.updateTask(taskId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(projectId: string) {
  const invalidate = useTaskInvalidation(projectId);
  return useMutation({ mutationFn: tasksApi.deleteTask, onSuccess: invalidate });
}

/**
 * Kanban drag-and-drop: the card moves immediately and the cached list is
 * rolled back if the API rejects the change.
 */
export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = useTaskInvalidation(projectId);

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      const queryKey = taskKeys.byProject(projectId);
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (tasks) =>
        tasks?.map((task) => (task.id === taskId ? { ...task, status } : task)),
      );

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.byProject(projectId), context.previousTasks);
      }
    },
    onSettled: invalidate,
  });
}
