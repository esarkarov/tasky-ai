import { useProjectFilter } from '@/features/projects/hooks/use-project-filter';
import { ProjectEntity } from '@/features/projects/types';
import { AddTaskButton } from '@/features/tasks/components/atoms/AddTaskButton/AddTaskButton';
import { TaskCard } from '@/features/tasks/components/organisms/TaskCard/TaskCard';
import { TaskForm } from '@/features/tasks/components/organisms/TaskForm/TaskForm';
import { useTaskOperations } from '@/features/tasks/hooks/use-task-operations';
import { Head } from '@/shared/components/atoms/Head/Head';
import { ItemList } from '@/shared/components/atoms/List/List';
import { LoadMoreButton } from '@/shared/components/atoms/LoadMoreButton/LoadMoreButton';
import { TotalCounter } from '@/shared/components/atoms/TotalCounter/TotalCounter';
import { AppTopBar } from '@/shared/components/organisms/AppTopBar/AppTopBar';
import { EmptyStateMessage } from '@/shared/components/organisms/EmptyStateMessage/EmptyStateMessage';
import { FilterSelect } from '@/shared/components/organisms/FilterSelect/FilterSelect';
import {
  PageContainer,
  PageHeader,
  PageList,
  PageTitle,
} from '@/shared/components/templates/PageTemplate/PageTemplate';
import { useLoadMore } from '@/shared/hooks/use-load-more';
import { ProjectsWithTasksLoaderData } from '@/shared/types';
import { startOfToday } from 'date-fns';
import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { useLoaderData } from 'react-router';

export const TodayPage = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const {
    tasks: { total, documents: taskDocs },
    projects: { documents: projectDocs },
  } = useLoaderData<ProjectsWithTasksLoaderData>();
  const {
    filteredTasks,
    filteredCount,
    filterValue: value,
    setFilterValue: handleValueChange,
  } = useProjectFilter({
    tasks: taskDocs,
  });
  const {
    items: visibleTasks,
    isLoading,
    hasMore,
    handleLoadMore,
    getItemClassName,
    getItemStyle,
  } = useLoadMore(filteredTasks || []);
  const { handleCreateTask } = useTaskOperations();

  return (
    <>
      <Head title="Tasky AI | Today" />

      <AppTopBar
        title="Today"
        totalCount={total}
      />

      <PageContainer aria-labelledby="today-page-title">
        <PageHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <PageTitle>Today</PageTitle>
              {total > 0 && (
                <TotalCounter
                  totalCount={total}
                  icon={ClipboardCheck}
                />
              )}
            </div>
            <FilterSelect
              projects={projectDocs}
              value={value}
              handleValueChange={handleValueChange}
            />
          </div>
        </PageHeader>

        <PageList aria-label="Today's tasks">
          {visibleTasks.map(({ $id, content, completed, due_date, projectId }, index) => (
            <ItemList
              key={$id}
              index={index}
              getClassName={getItemClassName}
              getStyle={getItemStyle}>
              <TaskCard
                id={$id}
                content={content}
                completed={completed}
                dueDate={due_date as Date}
                project={projectId as ProjectEntity}
              />
            </ItemList>
          ))}

          {!isFormOpen && (
            <AddTaskButton
              onClick={() => setIsFormOpen(true)}
              aria-label="Add new task for today"
            />
          )}

          {!filteredCount && !isFormOpen && <EmptyStateMessage variant="today" />}

          {isFormOpen && (
            <TaskForm
              defaultValues={{
                content: '',
                due_date: startOfToday(),
                projectId: null,
              }}
              className="mt-1"
              mode="create"
              handleCancel={() => setIsFormOpen(false)}
              onSubmit={handleCreateTask}
            />
          )}

          {hasMore && (
            <div className="flex justify-center py-6">
              <LoadMoreButton
                loading={isLoading}
                onClick={handleLoadMore}
              />
            </div>
          )}
        </PageList>
      </PageContainer>
    </>
  );
};
