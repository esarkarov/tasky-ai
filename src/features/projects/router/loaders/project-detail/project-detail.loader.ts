import { projectService } from '@/features/projects/services/project.service';
import type { LoaderFunction } from 'react-router';

export const projectDetailLoader: LoaderFunction = async ({ params }) => {
  const { projectId } = params;

  const [projects, project] = await Promise.all([
    projectService.findRecent(),
    projectService.findById(projectId as string),
  ]);

  return { project, projects };
};
