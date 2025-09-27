import { useCallback, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';
import { startOfToday } from 'date-fns';
import { Head } from '@/components/Head';
import { TopAppBar } from '@/components/TopAppBar';
import { Page, PageHeader, PageTitle, PageList } from '@/components/Page';
import { TaskCreateButton } from '@/components/TaskCreateButton';
import { TaskEmptyState } from '@/components/TaskEmptyState';
import { TaskForm } from '@/components/TaskForm';
import { TaskCard } from '@/components/TaskCard';
import { TaskCardSkeleton } from '@/components/TaskCardSkeleton';
import { CheckCircle2 } from 'lucide-react';
import { HTTP_METHODS, ROUTES } from '@/constants';
import type { Models } from 'appwrite';
import { ITaskForm } from '@/interfaces';

const TodayPage = () => {
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
      <Head title="Tasky AI | Today" />

      <TopAppBar
        title="Today"
        taskCount={tasks.total}
      />

      <Page>
        <PageHeader>
          <PageTitle>Today</PageTitle>

          {tasks.total > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 size={16} /> {tasks.total} tasks
            </div>
          )}
        </PageHeader>

        <PageList>
          {tasks.documents.map(({ $id, content, completed, due_date, project }) => (
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

          {!tasks.total && !isFormOpen && <TaskEmptyState />}

          {isFormOpen && (
            <TaskForm
              className="mt-1"
              mode="create"
              defaultFormData={{
                content: '',
                due_date: startOfToday(),
                projectId: null,
              }}
              onCancel={() => setIsFormOpen(false)}
              onSubmit={handleSubmitCreate}
            />
          )}
        </PageList>
      </Page>
    </>
  );
};

export default TodayPage;
