export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProjectRole = 'OWNER' | 'MEMBER';

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
export const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProjectMember {
  id: string;
  role: ProjectRole;
  createdAt: string;
  user: User;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  memberCount: number;
}

export interface ProjectDetail extends ProjectSummary {
  owner: User;
  members: ProjectMember[];
  currentUserRole: ProjectRole;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  assignee: User | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
  project?: { id: string; name: string };
}

export interface Comment {
  id: string;
  text: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  projectCount: number;
  assignedTaskCount: number;
  completedTaskCount: number;
  upcomingTasks: Task[];
}
