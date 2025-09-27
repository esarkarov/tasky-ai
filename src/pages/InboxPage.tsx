import { Head } from '@/components/Head';
import { Page, PageHeader, PageList, PageTitle } from '@/components/Page';
import { TaskCard } from '@/components/TaskCard';
import { TaskCardSkeleton } from '@/components/TaskCardSkeleton';
import { TaskCreateButton } from '@/components/TaskCreateButton';
import { TaskEmptyState } from '@/components/TaskEmptyState';
import { TaskForm } from '@/components/TaskForm';
import { TopAppBar } from '@/components/TopAppBar';
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
