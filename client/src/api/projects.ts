import { api } from './client';
import type { DashboardData, ProjectDetail, ProjectMember, ProjectSummary } from '@/types';

export interface ProjectPayload {
  name: string;
  description?: string | null;
  deadline?: string | null;
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const { data } = await api.get<ProjectSummary[]>('/projects');
  return data;
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const { data } = await api.get<ProjectDetail>(`/projects/${projectId}`);
  return data;
}

export async function createProject(payload: ProjectPayload): Promise<ProjectSummary> {
  const { data } = await api.post<ProjectSummary>('/projects', payload);
  return data;
}

export async function updateProject(
  projectId: string,
  payload: Partial<ProjectPayload>,
): Promise<ProjectSummary> {
  const { data } = await api.put<ProjectSummary>(`/projects/${projectId}`, payload);
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}

export async function listMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
  return data;
}

export async function addMember(projectId: string, email: string): Promise<ProjectMember> {
  const { data } = await api.post<ProjectMember>(`/projects/${projectId}/members`, { email });
  return data;
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
}
