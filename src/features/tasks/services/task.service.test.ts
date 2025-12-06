import { createMockTask, createMockTasks } from '@/core/test-setup/factories';
import type { AIGeneratedTask } from '@/features/ai/types';
import { taskRepository } from '@/features/tasks/repositories/task.repository';
import { taskService } from '@/features/tasks/services/task.service';
import { getUserId } from '@/shared/utils/auth/auth.utils';
import { generateID } from '@/shared/utils/text/text.utils';
import { startOfToday, startOfTomorrow } from 'date-fns';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/tasks/repositories/task.repository', () => ({
  taskRepository: {
    countTodayTasks: vi.fn(),
    countInboxTasks: vi.fn(),
    findCompletedTasks: vi.fn(),
    findInboxTasks: vi.fn(),
    findTodayTasks: vi.fn(),
    findUpcomingTasks: vi.fn(),
    createMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/shared/utils/auth/auth.utils', () => ({
  getUserId: vi.fn(),
}));

vi.mock('@/shared/utils/text/text.utils', () => ({
  generateID: vi.fn(),
}));

vi.mock('date-fns', () => ({
  startOfToday: vi.fn(),
  startOfTomorrow: vi.fn(),
}));

const mockRepository = vi.mocked(taskRepository);
const mockGetUserId = vi.mocked(getUserId);
const mockGenerateID = vi.mocked(generateID);
const mockStartOfToday = vi.mocked(startOfToday);
const mockStartOfTomorrow = vi.mocked(startOfTomorrow);

describe('taskService', () => {
  const MOCK_USER_ID = 'user-123';
  const MOCK_TASK_ID = 'task-456';
  const MOCK_PROJECT_ID = 'project-789';
  const MOCK_GENERATED_ID = 'generated-abc';
  const MOCK_TODAY = new Date('2025-01-01T00:00:00.000Z');
  const MOCK_TOMORROW = new Date('2025-01-02T00:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserId.mockReturnValue(MOCK_USER_ID);
    mockGenerateID.mockReturnValue(MOCK_GENERATED_ID);
    mockStartOfToday.mockReturnValue(MOCK_TODAY);
    mockStartOfTomorrow.mockReturnValue(MOCK_TOMORROW);
  });

  describe('findUpcomingTasks', () => {
    it('should return upcoming tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockRepository.findUpcomingTasks.mockResolvedValue(mockTasks);

      const result = await taskService.findUpcomingTasks();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockStartOfToday).toHaveBeenCalledOnce();
      expect(mockRepository.findUpcomingTasks).toHaveBeenCalledWith(MOCK_TODAY.toISOString(), MOCK_USER_ID);
      expect(mockRepository.findUpcomingTasks).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findUpcomingTasks.mockRejectedValue(new Error('Database connection failed'));

      await expect(taskService.findUpcomingTasks()).rejects.toThrow('Failed to load upcoming tasks. Please try again.');
      expect(mockRepository.findUpcomingTasks).toHaveBeenCalledOnce();
    });
  });

  describe('findTodayTasks', () => {
    it('should return today tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockRepository.findTodayTasks.mockResolvedValue(mockTasks);

      const result = await taskService.findTodayTasks();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockStartOfToday).toHaveBeenCalledOnce();
      expect(mockStartOfTomorrow).toHaveBeenCalledOnce();
      expect(mockRepository.findTodayTasks).toHaveBeenCalledWith(
        MOCK_TODAY.toISOString(),
        MOCK_TOMORROW.toISOString(),
        MOCK_USER_ID
      );
      expect(mockRepository.findTodayTasks).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findTodayTasks.mockRejectedValue(new Error('Database error'));

      await expect(taskService.findTodayTasks()).rejects.toThrow("Failed to load today's tasks. Please try again.");
      expect(mockRepository.findTodayTasks).toHaveBeenCalledOnce();
    });
  });

  describe('findInboxTasks', () => {
    it('should return inbox tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockRepository.findInboxTasks.mockResolvedValue(mockTasks);

      const result = await taskService.findInboxTasks();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockRepository.findInboxTasks).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(mockRepository.findInboxTasks).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findInboxTasks.mockRejectedValue(new Error('Database error'));

      await expect(taskService.findInboxTasks()).rejects.toThrow("Failed to load inbox's tasks. Please try again.");
      expect(mockRepository.findInboxTasks).toHaveBeenCalledOnce();
    });
  });

  describe('findCompletedTasks', () => {
    it('should return completed tasks for user', async () => {
      const mockTasks = createMockTasks();
      mockRepository.findCompletedTasks.mockResolvedValue(mockTasks);

      const result = await taskService.findCompletedTasks();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockRepository.findCompletedTasks).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(mockRepository.findCompletedTasks).toHaveBeenCalledOnce();
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findCompletedTasks.mockRejectedValue(new Error('Database error'));

      await expect(taskService.findCompletedTasks()).rejects.toThrow(
        'Failed to load completed tasks. Please try again.'
      );
      expect(mockRepository.findCompletedTasks).toHaveBeenCalledOnce();
    });
  });

  describe('countInboxTasks', () => {
    it('should return inbox task count', async () => {
      const expectedCount = 7;
      mockRepository.countInboxTasks.mockResolvedValue(expectedCount);

      const result = await taskService.countInboxTasks();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockRepository.countInboxTasks).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(mockRepository.countInboxTasks).toHaveBeenCalledOnce();
      expect(result).toBe(expectedCount);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.countInboxTasks.mockRejectedValue(new Error('Database error'));

      await expect(taskService.countInboxTasks()).rejects.toThrow('Failed to load inbox task count');
      expect(mockRepository.countInboxTasks).toHaveBeenCalledOnce();
    });
  });

  describe('countTodayTasks', () => {
    it('should return today task count', async () => {
      const expectedCount = 5;
      mockRepository.countTodayTasks.mockResolvedValue(expectedCount);

      const result = await taskService.countTodayTasks();

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockStartOfToday).toHaveBeenCalledOnce();
      expect(mockStartOfTomorrow).toHaveBeenCalledOnce();
      expect(mockRepository.countTodayTasks).toHaveBeenCalledWith(
        MOCK_TODAY.toISOString(),
        MOCK_TOMORROW.toISOString(),
        MOCK_USER_ID
      );
      expect(mockRepository.countTodayTasks).toHaveBeenCalledOnce();
      expect(result).toBe(expectedCount);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.countTodayTasks.mockRejectedValue(new Error('Database error'));

      await expect(taskService.countTodayTasks()).rejects.toThrow('Failed to load today task count');
      expect(mockRepository.countTodayTasks).toHaveBeenCalledOnce();
    });
  });

  describe('countTasks', () => {
    it('should return both inbox and today task counts', async () => {
      const inboxCount = 8;
      const todayCount = 4;
      mockRepository.countInboxTasks.mockResolvedValue(inboxCount);
      mockRepository.countTodayTasks.mockResolvedValue(todayCount);

      const result = await taskService.countTasks();

      expect(result).toEqual({ inboxTasks: inboxCount, todayTasks: todayCount });
      expect(mockRepository.countInboxTasks).toHaveBeenCalledOnce();
      expect(mockRepository.countTodayTasks).toHaveBeenCalledOnce();
    });

    it('should throw error when inbox count fails', async () => {
      mockRepository.countInboxTasks.mockRejectedValue(new Error('Inbox query failed'));
      mockRepository.countTodayTasks.mockResolvedValue(4);

      await expect(taskService.countTasks()).rejects.toThrow('Failed to load inbox task count');
    });

    it('should throw error when today count fails', async () => {
      mockRepository.countInboxTasks.mockResolvedValue(8);
      mockRepository.countTodayTasks.mockRejectedValue(new Error('Today query failed'));

      await expect(taskService.countTasks()).rejects.toThrow('Failed to load today task count');
    });
  });

  describe('createMany', () => {
    const createMockAITasks = (): AIGeneratedTask[] => [
      { content: 'AI Task 1', due_date: new Date('2025-12-31'), completed: false },
      { content: 'AI Task 2', due_date: null, completed: false },
    ];

    it('should create multiple tasks for project', async () => {
      const aiTasks = createMockAITasks();
      const createdTasks = [createMockTask(), createMockTask({ id: 'task-2' })];
      mockRepository.createMany.mockResolvedValue(createdTasks);

      const result = await taskService.createMany(MOCK_PROJECT_ID, aiTasks);

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockRepository.createMany).toHaveBeenCalledWith([
        {
          content: 'AI Task 1',
          due_date: aiTasks[0].due_date,
          completed: false,
          projectId: MOCK_PROJECT_ID,
          userId: MOCK_USER_ID,
        },
        {
          content: 'AI Task 2',
          due_date: null,
          completed: false,
          projectId: MOCK_PROJECT_ID,
          userId: MOCK_USER_ID,
        },
      ]);
      expect(mockRepository.createMany).toHaveBeenCalledOnce();
      expect(result).toEqual(createdTasks);
    });

    it('should throw error when repository fails', async () => {
      const aiTasks = createMockAITasks();
      mockRepository.createMany.mockRejectedValue(new Error('Batch insert failed'));

      await expect(taskService.createMany(MOCK_PROJECT_ID, aiTasks)).rejects.toThrow('Failed to create project tasks');
      expect(mockRepository.createMany).toHaveBeenCalledOnce();
    });
  });

  describe('create', () => {
    it('should create task with default completed status', async () => {
      const formData = {
        content: 'New task content',
        due_date: new Date('2025-12-15'),
        projectId: MOCK_PROJECT_ID,
      };
      const createdTask = createMockTask();
      mockRepository.create.mockResolvedValue(createdTask);

      const result = await taskService.create(formData);

      expect(mockGetUserId).toHaveBeenCalledOnce();
      expect(mockGenerateID).toHaveBeenCalledOnce();
      expect(mockRepository.create).toHaveBeenCalledWith(MOCK_GENERATED_ID, {
        content: formData.content,
        due_date: formData.due_date,
        completed: false,
        projectId: formData.projectId,
        userId: MOCK_USER_ID,
      });
      expect(mockRepository.create).toHaveBeenCalledOnce();
      expect(result).toEqual(createdTask);
    });

    it('should create task with provided completed status', async () => {
      const formData = {
        content: 'New task content',
        due_date: new Date('2025-12-15'),
        projectId: MOCK_PROJECT_ID,
        completed: true,
      };
      const createdTask = createMockTask({ completed: true });
      mockRepository.create.mockResolvedValue(createdTask);

      await taskService.create(formData);

      expect(mockRepository.create).toHaveBeenCalledWith(
        MOCK_GENERATED_ID,
        expect.objectContaining({ completed: true })
      );
    });

    it('should throw error when repository fails', async () => {
      const formData = {
        content: 'New task content',
        due_date: new Date('2025-12-15'),
        projectId: MOCK_PROJECT_ID,
      };
      mockRepository.create.mockRejectedValue(new Error('Insert failed'));

      await expect(taskService.create(formData)).rejects.toThrow('Failed to create task');
      expect(mockRepository.create).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update task with provided data', async () => {
      const updateData = {
        content: 'Updated task content',
        due_date: new Date('2025-12-20'),
        projectId: null,
      };
      const updatedTask = createMockTask(updateData);
      mockRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.update(MOCK_TASK_ID, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(MOCK_TASK_ID, updateData);
      expect(mockRepository.update).toHaveBeenCalledOnce();
      expect(result).toEqual(updatedTask);
    });

    it('should throw error when repository fails', async () => {
      const updateData = {
        content: 'Updated task content',
        due_date: new Date('2025-12-20'),
        projectId: null,
      };
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(taskService.update(MOCK_TASK_ID, updateData)).rejects.toThrow('Failed to update task');
      expect(mockRepository.update).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      mockRepository.delete.mockResolvedValue({});

      await taskService.delete(MOCK_TASK_ID);

      expect(mockRepository.delete).toHaveBeenCalledWith(MOCK_TASK_ID);
      expect(mockRepository.delete).toHaveBeenCalledOnce();
    });

    it('should throw error when repository fails', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Failed to delete task'));

      await expect(taskService.delete(MOCK_TASK_ID)).rejects.toThrow('Failed to delete task');
      expect(mockRepository.delete).toHaveBeenCalledOnce();
    });
  });
});
