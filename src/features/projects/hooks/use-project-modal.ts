import type { ProjectFormInput, UseProjectModalOptions, UseProjectModalResult } from '@/features/projects/types';
import { ROUTES } from '@/shared/constants/routes';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useProjectMutation } from './use-project-mutation';
import { useDisclosure } from '@/shared/hooks/use-disclosure';

export const useProjectModal = ({ mode = 'create', onSuccess }: UseProjectModalOptions = {}): UseProjectModalResult => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isViewingProject = pathname.startsWith('/projects/');
  const { close: closeModal } = useDisclosure();

  const { createProject, updateProject, deleteProject, isLoading } = useProjectMutation({
    onSuccess: () => {
      onSuccess?.();
      closeModal();
    },
  });

  const handleSave = useCallback(
    async (data: ProjectFormInput) => {
      if (mode === 'create') {
        await createProject(data);
      } else {
        await updateProject(data);
      }
    },
    [mode, createProject, updateProject]
  );
  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (isViewingProject && pathname.includes(id)) {
        navigate(ROUTES.INBOX);
      }

      await deleteProject(id, name);
    },
    [deleteProject, isViewingProject, navigate, pathname]
  );

  return {
    handleSave,
    handleDelete,
    isLoading,
  };
};
