import { useProjectFilter } from '@/features/projects/hooks/use-project-filter';
import { ProjectEntity } from '@/features/projects/types';
import { TaskCard } from '@/features/tasks/components/organisms/TaskCard/TaskCard';
import { Head } from '@/shared/components/atoms/Head/Head';
import { ItemList } from '@/shared/components/atoms/List/List';
import { LoadMoreButton } from '@/shared/components/atoms/LoadMoreButton/LoadMoreButton';
import { TotalCounter } from '@/shared/components/atoms/TotalCounter/TotalCounter';
import { AppTopBar } from '@/shared/components/organisms/AppTopBar/AppTopBar';
import { EmptyStateMessage } from '@/shared/components/organisms/EmptyStateMessage/EmptyStateMessage';
import { FilterSelect } from '@/shared/components/organisms/FilterSelect/FilterSelect';
import {
  PageContainer,
  PageHeader,
  PageList,
  PageTitle,
} from '@/shared/components/templates/PageTemplate/PageTemplate';
import { useLoadMore } from '@/shared/hooks/use-load-more/use-load-more';
import { ProjectsWithTasksLoaderData } from '@/shared/types';
import { ClipboardCheck } from 'lucide-react';
import { useLoaderData } from 'react-router';

export const CompletedPage = () => {
  const {
    tasks: { total, documents: taskDocs },
    projects: { documents: projectDocs },
  } = useLoaderData<ProjectsWithTasksLoaderData>();
  const {
    filteredTasks,
    filteredCount,
    filterValue: value,
    setFilterValue: handleValueChange,
  } = useProjectFilter({
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

      <AppTopBar
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
              handleValueChange={handleValueChange}
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
