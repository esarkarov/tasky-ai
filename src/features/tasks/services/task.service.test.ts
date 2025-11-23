import { createMockTask, createMockTasks } from '@/core/test-setup/factories';
import { AIGeneratedTask } from '@/features/ai/types';
import { taskRepository } from '@/features/tasks/repositories/task.repository';
import { taskService } from '@/features/tasks/services/task.service';
import { TaskFormInput } from '@/features/tasks/types';
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

const mockedTaskRepository = vi.mocked(taskRepository);
const mockedGetUserId = vi.mocked(getUserId);
const mockedGenerateID = vi.mocked(generateID);
const mockedStartOfToday = vi.mocked(startOfToday);
const mockedStartOfTomorrow = vi.mocked(startOfTomorrow);

describe('taskService', () => {
  const MOCK_USER_ID = 'user-123';
  const MOCK_TASK_ID = 'task-1';
  const MOCK_PROJECT_ID = 'project-123';
  const MOCK_TODAY_DATE = '2023-01-01T00:00:00.000Z';
  const MOCK_TOMORROW_DATE = '2023-01-02T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockReturnValue(MOCK_USER_ID);
    mockedStartOfToday.mockReturnValue(new Date(MOCK_TODAY_DATE));
    mockedStartOfTomorrow.mockReturnValue(new Date(MOCK_TOMORROW_DATE));
  });

  describe('get methods', () => {
    const testGetMethod = async (
      method: 'findUpcomingTasks' | 'findTodayTasks' | 'findInboxTasks' | 'findCompletedTasks',
      repositoryMethod: 'findUpcomingTasks' | 'findTodayTasks' | 'findInboxTasks' | 'findCompletedTasks',
      repositoryArgs: (string | Date)[],
      errorMessage: string,
      usesToday: boolean,
      usesTomorrow: boolean
    ) => {
      describe(method, () => {
        it('should return tasks successfully', async () => {
          const mockTasks = createMockTasks();
          mockedTaskRepository[repositoryMethod].mockResolvedValue(mockTasks);

          const result = await taskService[method]();

          expect(mockedGetUserId).toHaveBeenCalled();
          if (usesToday) expect(mockedStartOfToday).toHaveBeenCalled();
          if (usesTomorrow) expect(mockedStartOfTomorrow).toHaveBeenCalled();
          expect(mockedTaskRepository[repositoryMethod]).toHaveBeenCalledWith(...repositoryArgs);
          expect(result).toEqual(mockTasks);
        });

        it('should throw error when repository fails', async () => {
          mockedTaskRepository[repositoryMethod].mockRejectedValue(new Error('Database error'));

          await expect(taskService[method]()).rejects.toThrow(errorMessage);
        });
      });
    };

    testGetMethod(
      'findUpcomingTasks',
      'findUpcomingTasks',
      [MOCK_TODAY_DATE, MOCK_USER_ID],
      'Failed to load upcoming tasks. Please try again.',
      true,
      false
    );

    testGetMethod(
      'findTodayTasks',
      'findTodayTasks',
      [MOCK_TODAY_DATE, MOCK_TOMORROW_DATE, MOCK_USER_ID],
      "Failed to load today's tasks. Please try again.",
      true,
      true
    );

    testGetMethod(
      'findInboxTasks',
      'findInboxTasks',
      [MOCK_USER_ID],
      "Failed to load inbox's tasks. Please try again.",
      false,
      false
    );

    testGetMethod(
      'findCompletedTasks',
      'findCompletedTasks',
      [MOCK_USER_ID],
      'Failed to load completed tasks. Please try again.',
      false,
      false
    );
  });

  describe('count methods', () => {
    describe('countInboxTasks', () => {
      it('should return inbox task count successfully', async () => {
        const expectedCount = 5;
        mockedTaskRepository.countInboxTasks.mockResolvedValue(expectedCount);

        const result = await taskService.countInboxTasks();

        expect(mockedGetUserId).toHaveBeenCalled();
        expect(mockedTaskRepository.countInboxTasks).toHaveBeenCalledWith(MOCK_USER_ID);
        expect(result).toBe(expectedCount);
      });

      it('should throw error when repository fails', async () => {
        mockedTaskRepository.countInboxTasks.mockRejectedValue(new Error('Database error'));

        await expect(taskService.countInboxTasks()).rejects.toThrow('Failed to load inbox task count');
      });
    });

    describe('countTodayTasks', () => {
      it('should return today task count successfully', async () => {
        const expectedCount = 3;
        mockedTaskRepository.countTodayTasks.mockResolvedValue(expectedCount);

        const result = await taskService.countTodayTasks();

        expect(mockedGetUserId).toHaveBeenCalled();
        expect(mockedStartOfToday).toHaveBeenCalled();
        expect(mockedStartOfTomorrow).toHaveBeenCalled();
        expect(mockedTaskRepository.countTodayTasks).toHaveBeenCalledWith(
          MOCK_TODAY_DATE,
          MOCK_TOMORROW_DATE,
          MOCK_USER_ID
        );
        expect(result).toBe(expectedCount);
      });

      it('should throw error when repository fails', async () => {
        mockedTaskRepository.countTodayTasks.mockRejectedValue(new Error('Database error'));

        await expect(taskService.countTodayTasks()).rejects.toThrow('Failed to load today task count');
      });
    });

    describe('countTasks', () => {
      const mockErrorTestCases = [
        {
          scenario: 'inbox count fails',
          setupMocks: (mockedRepo: typeof mockedTaskRepository) => {
            mockedRepo.countInboxTasks.mockRejectedValue(new Error('Inbox error'));
            mockedRepo.countTodayTasks.mockResolvedValue(3);
          },
          expectedError: 'Failed to load inbox task count',
        },
        {
          scenario: 'today count fails',
          setupMocks: (mockedRepo: typeof mockedTaskRepository) => {
            mockedRepo.countInboxTasks.mockResolvedValue(5);
            mockedRepo.countTodayTasks.mockRejectedValue(new Error('Today error'));
          },
          expectedError: 'Failed to load today task count',
        },
      ];

      it('should return both inbox and today task counts successfully', async () => {
        const inboxCount = 5;
        const todayCount = 3;
        mockedTaskRepository.countInboxTasks.mockResolvedValue(inboxCount);
        mockedTaskRepository.countTodayTasks.mockResolvedValue(todayCount);

        const result = await taskService.countTasks();

        expect(result).toEqual({ inboxTasks: inboxCount, todayTasks: todayCount });
      });

      it.each(mockErrorTestCases)('should propagate error when $scenario', async ({ setupMocks, expectedError }) => {
        setupMocks(mockedTaskRepository);

        await expect(taskService.countTasks()).rejects.toThrow(expectedError);
      });
    });
  });

  describe('createMany', () => {
    const createMockAITasks = (): AIGeneratedTask[] => [
      { content: 'Task 1 content', due_date: new Date(), completed: false },
      { content: 'Task 2 content', due_date: null, completed: true },
    ];

    it('should create multiple tasks for project successfully', async () => {
      const mockAITasks = createMockAITasks();
      const mockCreatedTasks = [createMockTask(), createMockTask({ id: 'task-456' })];
      const mockGeneratedTasks = [
        {
          content: 'Task 1 content',
          due_date: mockAITasks[0].due_date,
          completed: false,
          projectId: MOCK_PROJECT_ID,
          userId: MOCK_USER_ID,
        },
        {
          content: 'Task 2 content',
          due_date: null,
          completed: true,
          projectId: MOCK_PROJECT_ID,
          userId: MOCK_USER_ID,
        },
      ];
      mockedTaskRepository.createMany.mockResolvedValue(mockCreatedTasks);

      const result = await taskService.createMany(MOCK_PROJECT_ID, mockAITasks);

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedTaskRepository.createMany).toHaveBeenCalledWith(mockGeneratedTasks);
      expect(result).toEqual(mockCreatedTasks);
    });

    it('should throw error when repository fails', async () => {
      const mockAITasks = createMockAITasks();
      mockedTaskRepository.createMany.mockRejectedValue(new Error('Database error'));

      await expect(taskService.createMany(MOCK_PROJECT_ID, mockAITasks)).rejects.toThrow(
        'Failed to create project tasks'
      );
    });
  });

  describe('create', () => {
    const MOCK_GENERATED_ID = 'generated-task-id';
    const createMockFormData = (overrides?: Partial<TaskFormInput>): TaskFormInput => ({
      content: 'New Task',
      due_date: new Date(),
      projectId: MOCK_PROJECT_ID,
      ...overrides,
    });

    it('should create task successfully with default completed status', async () => {
      const formData = createMockFormData();
      const mockTask = createMockTask();
      mockedGenerateID.mockReturnValue(MOCK_GENERATED_ID);
      mockedTaskRepository.create.mockResolvedValue(mockTask);

      const result = await taskService.create(formData);

      expect(mockedGetUserId).toHaveBeenCalled();
      expect(mockedGenerateID).toHaveBeenCalled();
      expect(mockedTaskRepository.create).toHaveBeenCalledWith(MOCK_GENERATED_ID, {
        content: formData.content,
        due_date: formData.due_date,
        completed: false,
        projectId: formData.projectId,
        userId: MOCK_USER_ID,
      });
      expect(result).toEqual(mockTask);
    });

    it('should create task with provided completed status', async () => {
      const formData = createMockFormData({ completed: true });
      const mockTask = createMockTask();
      mockedGenerateID.mockReturnValue(MOCK_GENERATED_ID);
      mockedTaskRepository.create.mockResolvedValue(mockTask);

      await taskService.create(formData);

      expect(mockedTaskRepository.create).toHaveBeenCalledWith(
        MOCK_GENERATED_ID,
        expect.objectContaining({ completed: true })
      );
    });

    it('should throw error when repository fails', async () => {
      const formData = createMockFormData();
      mockedGenerateID.mockReturnValue(MOCK_GENERATED_ID);
      mockedTaskRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(taskService.create(formData)).rejects.toThrow('Failed to create task');
    });
  });

  describe('update', () => {
    const createUpdateData = () => ({
      content: 'Updated Task',
      due_date: new Date(),
      projectId: null,
    });

    it('should update task successfully', async () => {
      const updateData = createUpdateData();
      const updatedTask = createMockTask(updateData);
      mockedTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.update(MOCK_TASK_ID, updateData);

      expect(mockedTaskRepository.update).toHaveBeenCalledWith(MOCK_TASK_ID, updateData);
      expect(result).toEqual(updatedTask);
    });

    it('should throw error when repository fails', async () => {
      const updateData = createUpdateData();
      mockedTaskRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(taskService.update(MOCK_TASK_ID, updateData)).rejects.toThrow('Failed to update task');
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      mockedTaskRepository.delete.mockResolvedValue({});

      await taskService.delete(MOCK_TASK_ID);

      expect(mockedTaskRepository.delete).toHaveBeenCalledWith(MOCK_TASK_ID);
    });

    it('should throw error when repository fails', async () => {
      mockedTaskRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(taskService.delete(MOCK_TASK_ID)).rejects.toThrow('Failed to delete task');
    });
  });
});
