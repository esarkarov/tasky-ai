import type { ProjectFormInput, UseProjectModalOptions, UseProjectModalResult } from '@/features/projects/types';
import { ROUTES } from '@/shared/constants/routes';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useProjectMutation } from './use-project-mutation';

export const useProjectModal = ({ mode = 'create', onSuccess }: UseProjectModalOptions = {}): UseProjectModalResult => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isViewingProject = pathname.startsWith('/projects/');

  const { createProject, updateProject, deleteProject, isLoading } = useProjectMutation({
    onSuccess: () => {
      onSuccess?.();
      setIsOpen(false);
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
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return {
    handleSave,
    handleDelete,
    openModal,
    closeModal,
    setIsOpen,
    isOpen,
    isLoading,
  };
};
