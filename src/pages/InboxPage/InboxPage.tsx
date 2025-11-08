import { AddTaskButton } from '@/components/atoms/AddTaskButton/AddTaskButton';
import { Head } from '@/components/atoms/Head/Head';
import { ItemList } from '@/components/atoms/List/List';
import { LoadMoreButton } from '@/components/atoms/LoadMoreButton/LoadMoreButton';
import { TotalCounter } from '@/components/atoms/TotalCounter/TotalCounter';
import { EmptyStateMessage } from '@/components/organisms/EmptyStateMessage';
import { TaskCard } from '@/components/organisms/TaskCard';
import { TaskForm } from '@/components/organisms/TaskForm';
import { TopAppBar } from '@/components/organisms/TopAppBar';
import { PageContainer, PageHeader, PageList, PageTitle } from '@/components/templates/PageTemplate/PageTemplate';
import { useLoadMore } from '@/hooks/use-load-more';
import { useTaskOperations } from '@/hooks/use-task-operations';
import { TasksLoaderData } from '@/types/loaders.types';
import { ProjectEntity } from '@/types/projects.types';
import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { useLoaderData } from 'react-router';

export const InboxPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    tasks: { total, documents: taskDocs },
  } = useLoaderData<TasksLoaderData>();
  const {
    items: visibleTasks,
    isLoading,
    hasMore,
    handleLoadMore,
    getItemClassName,
    getItemStyle,
  } = useLoadMore(taskDocs || []);
  const { handleCreateTask } = useTaskOperations();

  return (
    <>
      <Head title="Tasky AI | Inbox" />

      <TopAppBar
        title="Inbox"
        totalCount={total}
      />

      <PageContainer aria-labelledby="inbox-page-title">
        <PageHeader>
          <PageTitle>Inbox</PageTitle>
          {total > 0 && (
            <TotalCounter
              totalCount={total}
              icon={ClipboardCheck}
            />
          )}
        </PageHeader>

        <PageList aria-label="Inbox tasks">
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

          {!isFormOpen && <AddTaskButton onClick={() => setIsFormOpen(true)} />}

          {!total && !isFormOpen && <EmptyStateMessage variant="inbox" />}

          {isFormOpen && (
            <TaskForm
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
