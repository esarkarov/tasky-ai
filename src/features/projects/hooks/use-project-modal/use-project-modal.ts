import type { ProjectFormInput } from '@/features/projects/types';
import { ROUTES } from '@/shared/constants/routes';
import { useDisclosure } from '@/shared/hooks/use-disclosure/use-disclosure';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useProjectMutation } from '../use-project-mutation/use-project-mutation';
import { CrudMode } from '@/shared/types';
export interface UseProjectModalParams {
  mode?: CrudMode;
  onSuccess?: () => void;
}

export const useProjectModal = ({ mode = 'create', onSuccess }: UseProjectModalParams = {}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { close: cancelModal } = useDisclosure();
  const isViewingProject = pathname.startsWith(ROUTES.PROJECTS);

  const projectMutation = useProjectMutation({
    onSuccess: () => {
      onSuccess?.();
      cancelModal();
    },
  });

  const handleSave = useCallback(
    async (data: ProjectFormInput) => {
      if (mode === 'create') {
        await projectMutation.createProject(data);
      } else {
        await projectMutation.updateProject(data);
      }
    },
    [mode, projectMutation]
  );
  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (isViewingProject && pathname.includes(id)) {
        navigate(ROUTES.PROJECTS);
      }

      await projectMutation.deleteProject(id, name);
    },
    [isViewingProject, navigate, pathname, projectMutation]
  );

  return {
    handleSave,
    handleDelete,

    isLoading: projectMutation.isLoading,
  };
};
