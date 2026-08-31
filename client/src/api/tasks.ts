import { api } from './client';
import type { Task, TaskPriority, TaskStatus } from '@/types';

export interface TaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export async function listProjectTasks(projectId: string): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/projects/${projectId}/tasks`);
  return data;
}

export async function createTask(projectId: string, payload: TaskPayload): Promise<Task> {
  const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
  return data;
}

export async function getTask(taskId: string): Promise<Task> {
  const { data } = await api.get<Task>(`/tasks/${taskId}`);
  return data;
}

export async function updateTask(taskId: string, payload: Partial<TaskPayload>): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
