import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProjectSelection } from './use-project-selection';
import type { ProjectListItem } from '@/features/projects/types';

const createMockProject = (overrides?: Partial<ProjectListItem>): ProjectListItem => ({
  $id: 'project-1',
  name: 'Test Project',
  color_name: 'blue',
  color_hex: '#0000FF',
  $createdAt: '2024-01-01',
  $updatedAt: '2024-01-01',
  $collectionId: 'projects',
  $databaseId: 'db',
  $permissions: [],
  ...overrides,
});

describe('useProjectSelection', () => {
  const mockProjects: ProjectListItem[] = [
    createMockProject({ $id: 'project-1', name: 'Project 1', color_hex: '#FF0000' }),
    createMockProject({ $id: 'project-2', name: 'Project 2', color_hex: '#00FF00' }),
    createMockProject({ $id: 'project-3', name: 'Project 3', color_hex: '#0000FF' }),
  ];

  describe('initial state', () => {
    it('initializes with empty selected project when no defaultProjectId provided', () => {
      const { result } = renderHook(() => useProjectSelection({ projects: mockProjects }));

      expect(result.current.selectedProject).toEqual({
        id: null,
        name: '',
        colorHex: '',
      });
    });

    it('initializes with defaultProjectId and populates project details', async () => {
      const { result } = renderHook(() =>
        useProjectSelection({ defaultProjectId: 'project-1', projects: mockProjects })
      );

      await waitFor(() => {
        expect(result.current.selectedProject).toEqual({
          id: 'project-1',
          name: 'Project 1',
          colorHex: '#FF0000',
        });
      });
    });
  });

  describe('handleProjectChange', () => {
    it('updates selected project with full details when project is changed', () => {
      const { result } = renderHook(() => useProjectSelection({ projects: mockProjects }));

      act(() => {
        result.current.handleProjectChange({
          id: 'project-2',
          name: 'Project 2',
          colorHex: '#00FF00',
        });
      });

      expect(result.current.selectedProject).toEqual({
        id: 'project-2',
        name: 'Project 2',
        colorHex: '#00FF00',
      });
    });

    it('updates project details when projects array changes', async () => {
      const { result, rerender } = renderHook(
        ({ projects }) => useProjectSelection({ defaultProjectId: 'project-1', projects }),
        { initialProps: { projects: mockProjects } }
      );

      await waitFor(() => {
        expect(result.current.selectedProject.name).toBe('Project 1');
      });

      const updatedProjects: ProjectListItem[] = [
        createMockProject({ $id: 'project-1', name: 'Updated Project 1', color_hex: '#FF00FF' }),
      ];

      rerender({ projects: updatedProjects });

      await waitFor(() => {
        expect(result.current.selectedProject).toEqual({
          id: 'project-1',
          name: 'Updated Project 1',
          colorHex: '#FF00FF',
        });
      });
    });

    it('handles project change when selectedProject id matches a project in the list', async () => {
      const { result } = renderHook(() => useProjectSelection({ projects: mockProjects }));

      act(() => {
        result.current.handleProjectChange({
          id: 'project-3',
          name: '',
          colorHex: '',
        });
      });

      await waitFor(() => {
        expect(result.current.selectedProject).toEqual({
          id: 'project-3',
          name: 'Project 3',
          colorHex: '#0000FF',
        });
      });
    });
  });

  describe('clearProject', () => {
    it('clears selected project', () => {
      const { result } = renderHook(() =>
        useProjectSelection({ defaultProjectId: 'project-1', projects: mockProjects })
      );

      act(() => {
        result.current.clearProject();
      });

      expect(result.current.selectedProject).toEqual({
        id: null,
        name: '',
        colorHex: '',
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty projects array', () => {
      const { result } = renderHook(() => useProjectSelection({ defaultProjectId: 'project-1', projects: [] }));

      expect(result.current.selectedProject).toEqual({
        id: 'project-1',
        name: '',
        colorHex: '',
      });
    });

    it('does not update project details when selected project is not in the list', async () => {
      const { result } = renderHook(() =>
        useProjectSelection({ defaultProjectId: 'non-existent-project', projects: mockProjects })
      );

      expect(result.current.selectedProject).toEqual({
        id: 'non-existent-project',
        name: '',
        colorHex: '',
      });
    });
  });
});
