import { Head } from '@/components/atoms/Head/Head';
import { ItemList } from '@/components/atoms/List/List';
import { LoadMoreButton } from '@/components/atoms/LoadMoreButton/LoadMoreButton';
import { PageContainer, PageHeader, PageList, PageTitle } from '@/components/atoms/Page/Page';
import { TotalCounter } from '@/components/atoms/TotalCounter/TotalCounter';
import { EmptyStateMessage } from '@/components/organisms/EmptyStateMessage';
import { FilterSelect } from '@/components/organisms/FilterSelect';
import { TaskCard } from '@/components/organisms/TaskCard';
import { TopAppBar } from '@/components/organisms/TopAppBar';
import { useLoadMore } from '@/hooks/use-load-more';
import { useProjectFilter } from '@/hooks/use-project-filter';
import { ProjectTaskLoaderData } from '@/types/loaders.types';
import { ProjectEntity } from '@/types/projects.types';
import { ClipboardCheck } from 'lucide-react';
import { useLoaderData } from 'react-router';

export const CompletedPage = () => {
  const {
    tasks: { total, documents: taskDocs },
    projects: { documents: projectDocs },
  } = useLoaderData<ProjectTaskLoaderData>();
  const { filteredTasks, filteredCount, value, setValue } = useProjectFilter({
    tasks: taskDocs,
  });
  const {
    items: visibleTasks,
    isLoading,
    hasMore,
    handleLoadMore,
    getItemClassName,
    getItemStyle,
  } = useLoadMore(filteredTasks || []);

  return (
    <>
      <Head title="Tasky AI | Completed" />

      <TopAppBar
        title="Completed"
        totalCount={total}
      />

      <PageContainer aria-labelledby="completed-page-title">
        <PageHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <PageTitle>Completed</PageTitle>
              {total > 0 && (
                <TotalCounter
                  totalCount={total}
                  icon={ClipboardCheck}
                />
              )}
            </div>
            <FilterSelect
              projects={projectDocs}
              value={value}
              handleValueChange={setValue}
            />
          </div>
        </PageHeader>

        <PageList aria-label="Completed tasks">
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

          {!filteredCount && <EmptyStateMessage variant="completed" />}

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
