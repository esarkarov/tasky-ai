import { AddTaskButton } from '@/components/atoms/AddTaskButton/AddTaskButton';
import { Head } from '@/components/atoms/Head/Head';
import { ItemList } from '@/components/atoms/List/List';
import { LoadMoreButton } from '@/components/atoms/LoadMoreButton/LoadMoreButton';
import { TotalCounter } from '@/components/atoms/TotalCounter/TotalCounter';
import { EmptyStateMessage } from '@/components/organisms/EmptyStateMessage';
import { FilterSelect } from '@/components/organisms/FilterSelect';
import { TaskCard } from '@/components/organisms/TaskCard';
import { TaskForm } from '@/components/organisms/TaskForm';
import { TopAppBar } from '@/components/organisms/TopAppBar';
import { PageContainer, PageHeader, PageList, PageTitle } from '@/components/templates/PageTemplate/PageTemplate';
import { useLoadMore } from '@/hooks/use-load-more';
import { useProjectFilter } from '@/hooks/use-project-filter';
import { useTaskOperations } from '@/hooks/use-task-operations';
import { ProjectTaskLoaderData } from '@/types/loaders.types';
import { ProjectEntity } from '@/types/projects.types';
import { startOfToday } from 'date-fns';
import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { useLoaderData } from 'react-router';

export const TodayPage = () => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const {
    tasks: { total, documents: taskDocs },
    projects: { documents: projectDocs },
  } = useLoaderData<ProjectTaskLoaderData>();
  const { filteredTasks, filteredCount, value, setValue } = useProjectFilter({
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

      <TopAppBar
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
              handleValueChange={setValue}
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
