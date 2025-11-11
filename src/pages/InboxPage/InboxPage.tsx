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
import {
  PageContainer,
  PageHeader,
  PageList,
  PageTitle,
} from '@/shared/components/templates/PageTemplate/PageTemplate';
import { useLoadMore } from '@/shared/hooks/use-load-more';
import { TasksLoaderData } from '@/shared/types';
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

      <AppTopBar
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
