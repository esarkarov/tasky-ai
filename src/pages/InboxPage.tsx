import { Head } from '@/components/Head';
import { Page, PageHeader, PageList, PageTitle } from '@/components/Page';
import { TaskCard } from '@/components/TaskCard';
import { TaskCardSkeleton } from '@/components/TaskCardSkeleton';
import { TaskCreateButton } from '@/components/TaskCreateButton';
import { TaskEmptyState } from '@/components/TaskEmptyState';
import { TaskForm } from '@/components/TaskForm';
import { TopAppBar } from '@/components/TopAppBar';
import { Models } from 'appwrite';
import { useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';

const InboxPage = () => {
  const fetcher = useFetcher();
  const { tasks } = useLoaderData<{
    tasks: Models.DocumentList<Models.Document>;
  }>();
  const [taskFormShow, setTaskFormShow] = useState(false);

  return (
    <>
      <Head title='Tasky AI | Inbox' />

      <TopAppBar title='Inbox' />

      <Page>
        <PageHeader>
          <PageTitle>Inbox</PageTitle>
        </PageHeader>

        <PageList>
          {tasks?.documents.map(
            ({ $id, content, completed, due_date, project }) => (
              <TaskCard
                key={$id}
                id={$id}
                content={content}
                completed={completed}
                dueDate={due_date}
                project={project}
              />
            ),
          )}

          {fetcher.state !== 'idle' && <TaskCardSkeleton />}

          {!taskFormShow && (
            <TaskCreateButton onClick={() => setTaskFormShow(true)} />
          )}

          {!taskFormShow && <TaskEmptyState type='inbox' />}

          {taskFormShow && (
            <TaskForm
              className='mt-1'
              mode='create'
              onCancel={() => setTaskFormShow(false)}
              onSubmit={(formData) => {
                fetcher.submit(JSON.stringify(formData), {
                  action: '/app',
                  method: 'POST',
                  encType: 'application/json',
                });
              }}
            />
          )}
        </PageList>
      </Page>
    </>
  );
};

export default InboxPage;
