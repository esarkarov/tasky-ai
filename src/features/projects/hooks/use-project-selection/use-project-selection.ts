import type { ProjectListItem, SelectedProject } from '@/features/projects/types';
import { useCallback, useEffect, useState } from 'react';
export interface UseProjectSelectionParams {
  defaultProjectId?: string | null;
  projects: ProjectListItem[];
}

export const useProjectSelection = ({ defaultProjectId, projects }: UseProjectSelectionParams) => {
  const [selectedProject, setSelectedProject] = useState<SelectedProject>({
    id: defaultProjectId || null,
    name: '',
    colorHex: '',
  });

  useEffect(() => {
    if (selectedProject.id && projects) {
      const project = projects.find(({ $id }) => selectedProject.id === $id);
      if (project) {
        setSelectedProject({
          id: project.$id,
          name: project.name,
          colorHex: project.color_hex,
        });
      }
    }
  }, [selectedProject.id, projects]);

  const handleProjectChange = useCallback((project: SelectedProject) => {
    setSelectedProject(project);
  }, []);
  const clearProject = useCallback(() => {
    setSelectedProject({ id: null, name: '', colorHex: '' });
  }, []);

  return {
    selectedProject,

    handleProjectChange,
    clearProject,
  };
};
