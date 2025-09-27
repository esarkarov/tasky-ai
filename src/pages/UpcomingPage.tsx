import { Page, PageHeader, PageList, PageTitle } from '@/components/layout/Page';
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { Head } from '@/components/shared/Head';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskEmptyState } from '@/components/tasks/TaskEmptyState';
import type { Models } from 'appwrite';
import { CheckCircle2 } from 'lucide-react';
import { useLoaderData } from 'react-router';

const UpcomingPage = () => {
  const { tasks } = useLoaderData<{
    tasks: Models.DocumentList<Models.Document>;
  }>();

  return (
    <>
      <Head title="Tasky AI | Upcoming" />

      <TopAppBar
        title="Upcoming"
        taskCount={tasks.total}
      />

      <Page>
        <PageHeader>
          <PageTitle>Upcoming</PageTitle>

          {tasks.total > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 size={16} /> {tasks.total} tasks
            </div>
          )}
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

          {!tasks.total && <TaskEmptyState type="upcoming" />}
        </PageList>
      </Page>
    </>
  );
};

export default UpcomingPage;
