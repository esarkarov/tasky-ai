import { Page, PageHeader, PageList, PageTitle } from '@/components/layout/Page';
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { Head } from '@/components/shared/Head';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskCardSkeleton } from '@/components/tasks/TaskCardSkeleton';
import { TaskCreateButton } from '@/components/tasks/TaskCreateButton';
import { TaskEmptyState } from '@/components/tasks/TaskEmptyState';
import { TaskForm } from '@/components/tasks/TaskForm';
import { HTTP_METHODS, ROUTES } from '@/constants';
import { ITaskForm } from '@/interfaces';
import { Models } from 'appwrite';
import { useCallback, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';

const InboxPage = () => {
  const fetcher = useFetcher();
  const { tasks } = useLoaderData<{
    tasks: Models.DocumentList<Models.Document>;
  }>();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const handleSubmitCreate = useCallback(
    (formData: ITaskForm) => {
      fetcher.submit(JSON.stringify(formData), {
        action: ROUTES.APP,
        method: HTTP_METHODS.POST,
        encType: 'application/json',
      });
    },
    [fetcher]
  );

  return (
    <>
      <Head title="Tasky AI | Inbox" />

      <TopAppBar title="Inbox" />

      <Page>
        <PageHeader>
          <PageTitle>Inbox</PageTitle>
        </PageHeader>

        <PageList>
          {tasks?.documents.map(({ $id, content, completed, due_date, project }) => (
            <TaskCard
              key={$id}
              id={$id}
              content={content}
              completed={completed}
              dueDate={due_date}
              project={project}
            />
          ))}

          {fetcher.state !== 'idle' && <TaskCardSkeleton />}

          {!isFormOpen && <TaskCreateButton onClick={() => setIsFormOpen(true)} />}

          {!isFormOpen && <TaskEmptyState type="inbox" />}

          {isFormOpen && (
            <TaskForm
              className="mt-1"
              mode="create"
              onCancel={() => setIsFormOpen(false)}
              onSubmit={handleSubmitCreate}
            />
          )}
        </PageList>
      </Page>
    </>
  );
};

export default InboxPage;
