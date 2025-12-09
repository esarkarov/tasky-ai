import { createMockProject } from '@/core/test-setup/factories';
import { useProjectSelection } from '@/features/projects/hooks/use-project-selection/use-project-selection';
import type { ProjectListItem, SelectedProject } from '@/features/projects/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useProjectSelection', () => {
  const createProjectsFixture = (): ProjectListItem[] => [
    createMockProject({ $id: 'project-1', name: 'Project 1', color_hex: '#FF0000' }),
    createMockProject({ $id: 'project-2', name: 'Project 2', color_hex: '#00FF00' }),
    createMockProject({ $id: 'project-3', name: 'Project 3', color_hex: '#0000FF' }),
  ];

  const createSelectedProject = (id: string | null, name: string, colorHex: string): SelectedProject => ({
    id,
    name,
    colorHex,
  });

  const emptySelectedProject = createSelectedProject(null, '', '');

  describe('initialization', () => {
    it('should initialize with null id when no defaultProjectId provided', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(result.current.selectedProject.id).toBeNull();
    });

    it('should initialize with empty name when no defaultProjectId provided', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(result.current.selectedProject.name).toBe('');
    });

    it('should initialize with empty colorHex when no defaultProjectId provided', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(result.current.selectedProject.colorHex).toBe('');
    });

    it('should initialize with defaultProjectId', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects }));

      expect(result.current.selectedProject.id).toBe('project-1');
    });

    it('should populate project details when defaultProjectId matches project', async () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects }));

      await waitFor(() => {
        expect(result.current.selectedProject).toEqual(createSelectedProject('project-1', 'Project 1', '#FF0000'));
      });
    });

    it('should handle null defaultProjectId explicitly', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: null, projects }));

      expect(result.current.selectedProject).toEqual(emptySelectedProject);
    });
  });

  describe('handleProjectChange', () => {
    it('should update selected project with provided details', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      act(() => {
        result.current.handleProjectChange(createSelectedProject('project-2', 'Project 2', '#00FF00'));
      });

      expect(result.current.selectedProject).toEqual(createSelectedProject('project-2', 'Project 2', '#00FF00'));
    });

    it('should auto-populate details when id matches project in list', async () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      act(() => {
        result.current.handleProjectChange(createSelectedProject('project-3', '', ''));
      });

      await waitFor(() => {
        expect(result.current.selectedProject).toEqual(createSelectedProject('project-3', 'Project 3', '#0000FF'));
      });
    });

    it('should update to different project', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects }));

      act(() => {
        result.current.handleProjectChange(createSelectedProject('project-2', 'Project 2', '#00FF00'));
      });

      expect(result.current.selectedProject.id).toBe('project-2');
    });

    it('should handle multiple project changes', async () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      act(() => {
        result.current.handleProjectChange(createSelectedProject('project-1', '', ''));
      });

      await waitFor(() => {
        expect(result.current.selectedProject.name).toBe('Project 1');
      });

      act(() => {
        result.current.handleProjectChange(createSelectedProject('project-2', '', ''));
      });

      await waitFor(() => {
        expect(result.current.selectedProject.name).toBe('Project 2');
      });
    });
  });

  describe('clearProject', () => {
    it('should reset id to null', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects }));

      act(() => {
        result.current.clearProject();
      });

      expect(result.current.selectedProject.id).toBeNull();
    });

    it('should reset name to empty string', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects }));

      act(() => {
        result.current.clearProject();
      });

      expect(result.current.selectedProject.name).toBe('');
    });

    it('should reset colorHex to empty string', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects }));

      act(() => {
        result.current.clearProject();
      });

      expect(result.current.selectedProject.colorHex).toBe('');
    });

    it('should clear project after selection', async () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      act(() => {
        result.current.handleProjectChange(createSelectedProject('project-2', 'Project 2', '#00FF00'));
      });

      act(() => {
        result.current.clearProject();
      });

      expect(result.current.selectedProject).toEqual(emptySelectedProject);
    });
  });

  describe('projects prop changes', () => {
    it('should update details when projects array changes', async () => {
      const initialProjects = createProjectsFixture();
      const { result, rerender } = renderHook(
        ({ projects }) => useProjectSelection({ defaultProjectId: 'project-1', projects }),
        { initialProps: { projects: initialProjects } }
      );

      await waitFor(() => {
        expect(result.current.selectedProject.name).toBe('Project 1');
      });

      const updatedProjects: ProjectListItem[] = [
        createMockProject({
          $id: 'project-1',
          name: 'Updated Project 1',
          color_hex: '#FF00FF',
        }),
      ];

      rerender({ projects: updatedProjects });

      await waitFor(() => {
        expect(result.current.selectedProject).toEqual(
          createSelectedProject('project-1', 'Updated Project 1', '#FF00FF')
        );
      });
    });

    it('should maintain selection when project details are updated', async () => {
      const initialProjects = createProjectsFixture();
      const { result, rerender } = renderHook(
        ({ projects }) => useProjectSelection({ defaultProjectId: 'project-2', projects }),
        { initialProps: { projects: initialProjects } }
      );

      await waitFor(() => {
        expect(result.current.selectedProject.colorHex).toBe('#00FF00');
      });

      const updatedProjects = [
        ...initialProjects.slice(0, 1),
        createMockProject({
          $id: 'project-2',
          name: 'Project 2 Updated',
          color_hex: '#FFFF00',
        }),
        ...initialProjects.slice(2),
      ];

      rerender({ projects: updatedProjects });

      await waitFor(() => {
        expect(result.current.selectedProject.colorHex).toBe('#FFFF00');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty projects array with defaultProjectId', () => {
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects: [] }));

      expect(result.current.selectedProject).toEqual(createSelectedProject('project-1', '', ''));
    });

    it('should not update details when project not found in list', async () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'non-existent', projects }));

      expect(result.current.selectedProject).toEqual(createSelectedProject('non-existent', '', ''));
    });

    it('should handle changing to non-existent project', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      act(() => {
        result.current.handleProjectChange(createSelectedProject('non-existent', 'Unknown', '#000000'));
      });

      expect(result.current.selectedProject).toEqual(createSelectedProject('non-existent', 'Unknown', '#000000'));
    });

    it('should handle clearing when no project selected', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      act(() => {
        result.current.clearProject();
      });

      expect(result.current.selectedProject).toEqual(emptySelectedProject);
    });
  });

  describe('hook API', () => {
    it('should expose selectedProject property', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(result.current).toHaveProperty('selectedProject');
    });

    it('should expose handleProjectChange method', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(typeof result.current.handleProjectChange).toBe('function');
    });

    it('should expose clearProject method', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(typeof result.current.clearProject).toBe('function');
    });

    it('should expose selectedProject with correct structure', () => {
      const projects = createProjectsFixture();
      const { result } = renderHook(() => useProjectSelection({ projects }));

      expect(result.current.selectedProject).toHaveProperty('id');
      expect(result.current.selectedProject).toHaveProperty('name');
      expect(result.current.selectedProject).toHaveProperty('colorHex');
    });
  });
});
