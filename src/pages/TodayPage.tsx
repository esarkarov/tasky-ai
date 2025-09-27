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
import type { Models } from 'appwrite';
import { startOfToday } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';

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
