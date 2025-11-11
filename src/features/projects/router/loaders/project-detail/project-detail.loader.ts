import { projectService } from '@/features/projects/services/project.service';
import type { LoaderFunction } from 'react-router';

export const projectDetailLoader: LoaderFunction = async ({ params }) => {
  const { projectId } = params as { projectId: string };

  const [projects, project] = await Promise.all([projectService.findRecent(), projectService.findById(projectId)]);

  return { project, projects };
};
