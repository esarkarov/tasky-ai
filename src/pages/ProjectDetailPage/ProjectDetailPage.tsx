import { ProjectActionMenu } from '@/features/projects/components/organisms/ProjectActionMenu/ProjectActionMenu';
import { AddTaskButton } from '@/features/tasks/components/atoms/AddTaskButton/AddTaskButton';
import { TaskCard } from '@/features/tasks/components/organisms/TaskCard/TaskCard';
import { TaskForm } from '@/features/tasks/components/organisms/TaskForm/TaskForm';
import { useTaskMutation } from '@/features/tasks/hooks/use-task-mutation';
import { TaskEntity } from '@/features/tasks/types';
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
import { Button } from '@/shared/components/ui/button';
import { useDisclosure } from '@/shared/hooks/use-disclosure';
import { useLoadMore } from '@/shared/hooks/use-load-more';
import { ProjectDetailLoaderData } from '@/shared/types';
import { ClipboardCheck, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { useLoaderData } from 'react-router';

export const ProjectDetailPage = () => {
  const { isOpen, open: openForm, close: cancelForm } = useDisclosure();
  const { project } = useLoaderData<ProjectDetailLoaderData>();
  const { tasks, name, color_hex, color_name, $id } = project;
  const { handleCreate } = useTaskMutation({
    onSuccess: cancelForm,
  });

  const filteredProjectTasks = useMemo(() => {
    const incompleteTasks = tasks?.filter((task) => !task.completed) as TaskEntity[];

    const sortedTasks = incompleteTasks?.sort((taskA, taskB) => {
      if (!taskA.due_date && !taskB.due_date) return 0;
      if (!taskA.due_date) return 1;
      if (!taskB.due_date) return -1;
      return new Date(taskA.due_date).getTime() - new Date(taskB.due_date).getTime();
    });

    return sortedTasks;
  }, [tasks]);

  const {
    items: visibleProjectTasks,
    isLoading,
    hasMore,
    handleLoadMore,
    getItemClassName,
    getItemStyle,
  } = useLoadMore(filteredProjectTasks || []);

  return (
    <>
      <Head title={`Tasky AI | ${name}`} />

      <AppTopBar
        title={name}
        totalCount={filteredProjectTasks?.length}
      />

      <PageContainer aria-labelledby="project-detail-title">
        <PageHeader>
          <div className="flex items-center gap-2">
            <PageTitle>{name}</PageTitle>

            <ProjectActionMenu
              defaultValues={{
                id: $id,
                name: name,
                color_name: color_name,
                color_hex: color_hex,
              }}>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 shrink-0"
                aria-label={`More actions for project ${name}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </ProjectActionMenu>
          </div>
          {filteredProjectTasks?.length > 0 && (
            <TotalCounter
              totalCount={filteredProjectTasks?.length}
              icon={ClipboardCheck}
            />
          )}
        </PageHeader>

        <PageList aria-label={`Tasks for project ${name}`}>
          {visibleProjectTasks?.map(({ $id, content, completed, due_date }, index) => (
            <ItemList
              key={$id}
              index={index}
              getClassName={getItemClassName}
              getStyle={getItemStyle}>
              <TaskCard
                key={$id}
                id={$id}
                content={content}
                completed={completed}
                dueDate={due_date}
                project={project}
              />
            </ItemList>
          ))}

          {!isOpen && (
            <AddTaskButton
              onClick={openForm}
              aria-label="Add new task to this project"
            />
          )}

          {!filteredProjectTasks?.length && !isOpen && <EmptyStateMessage variant="project" />}

          {isOpen && (
            <TaskForm
              className="mt-1"
              mode="create"
              defaultValues={{
                content: '',
                due_date: null,
                projectId: $id,
              }}
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
