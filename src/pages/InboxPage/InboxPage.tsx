import { ProjectEntity } from '@/features/projects/types';
import { AddTaskButton } from '@/features/tasks/components/atoms/AddTaskButton/AddTaskButton';
import { TaskCard } from '@/features/tasks/components/organisms/TaskCard/TaskCard';
import { TaskForm } from '@/features/tasks/components/organisms/TaskForm/TaskForm';
import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation';
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
import { useDisclosure } from '@/shared/hooks/use-disclosure';
import { useLoadMore } from '@/shared/hooks/use-load-more';
import { TasksLoaderData } from '@/shared/types';
import { ClipboardCheck } from 'lucide-react';
import { useLoaderData } from 'react-router';

export const InboxPage = () => {
  const { isOpen, open: openForm, close: cancelForm } = useDisclosure();
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
  const { handleCreate } = useTaskMutation({
    onSuccess: cancelForm,
  });

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

          {!isOpen && <AddTaskButton onClick={openForm} />}

          {!total && !isOpen && <EmptyStateMessage variant="inbox" />}

          {isOpen && (
            <TaskForm
              className="mt-1"
              mode="create"
              handleCancel={cancelForm}
              onSubmit={handleCreate}
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
