import { useOutletContext } from 'react-router-dom';
import type { ProjectDetail } from '@/types';

export interface ProjectOutletContext {
  project: ProjectDetail;
}

export function useProjectContext(): ProjectDetail {
  return useOutletContext<ProjectOutletContext>().project;
}
