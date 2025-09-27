import { Page, PageHeader, PageList, PageTitle } from '@/components/layout/Page';
import { TopAppBar } from '@/components/navigation/TopAppBar';
import { Head } from '@/components/shared/Head';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskEmptyState } from '@/components/tasks/TaskEmptyState';
import type { Models } from 'appwrite';
import { useLoaderData } from 'react-router';

const CompletedPage = () => {
  const { tasks } = useLoaderData<{
    tasks: Models.DocumentList<Models.Document>;
  }>();

  return (
    <>
      <Head title="Completed – Tasky AI" />

      <TopAppBar title="Completed" />

      <Page>
        <PageHeader>
          <PageTitle>Completed</PageTitle>
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

          {!tasks.total && <TaskEmptyState type="completed" />}
        </PageList>
      </Page>
    </>
  );
};

export default CompletedPage;
