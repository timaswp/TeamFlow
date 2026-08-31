import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';

export const projectKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['projects', projectId] as const,
  members: (projectId: string) => ['projects', projectId, 'members'] as const,
  dashboard: ['dashboard'] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectKeys.all, queryFn: projectsApi.listProjects });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectsApi.getProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useDashboard() {
  return useQuery({ queryKey: projectKeys.dashboard, queryFn: projectsApi.getDashboard });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<projectsApi.ProjectPayload>) =>
      projectsApi.updateProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectKeys.dashboard });
    },
  });
}

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => projectsApi.listMembers(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => projectsApi.addMember(projectId, email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
