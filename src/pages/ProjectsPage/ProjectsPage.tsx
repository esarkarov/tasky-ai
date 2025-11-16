import { ProjectSearchField } from '@/features/projects/components/molecules/ProjectSearchField/ProjectSearchField';
import { ProjectCard } from '@/features/projects/components/organisms/ProjectCard/ProjectCard';
import { ProjectFormDialog } from '@/features/projects/components/organisms/ProjectFormDialog/ProjectFormDialog';
import { useProjectSearch } from '@/features/projects/hooks/use-project-search';
import { Head } from '@/shared/components/atoms/Head/Head';
import { ItemList } from '@/shared/components/atoms/List/List';
import { LoadMoreButton } from '@/shared/components/atoms/LoadMoreButton/LoadMoreButton';
import { TotalCounter } from '@/shared/components/atoms/TotalCounter/TotalCounter';
import { AppTopBar } from '@/shared/components/organisms/AppTopBar/AppTopBar';
import {
  PageContainer,
  PageHeader,
  PageList,
  PageTitle,
} from '@/shared/components/templates/PageTemplate/PageTemplate';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { useLoadMore } from '@/shared/hooks/use-load-more/use-load-more';
import { ProjectsLoaderData } from '@/shared/types';
import { cn } from '@/shared/utils/ui/ui.utils';
import { FolderKanban, Plus } from 'lucide-react';
import { useFetcher, useLoaderData } from 'react-router';

export const ProjectsPage = () => {
  const fetcher = useFetcher();
  const { isSearching, isIdle, handleSearchChange } = useProjectSearch();
  const {
    projects: { total, documents: projectDocs },
  } = useLoaderData<ProjectsLoaderData>();
  const {
    items: visibleProjects,
    isLoading,
    hasMore,
    handleLoadMore,
    getItemClassName,
    getItemStyle,
  } = useLoadMore(projectDocs || []);

  return (
    <>
      <Head title="Tasky AI | My Projects" />

      <AppTopBar
        title="My Projects"
        totalCount={total}
        label="project"
      />

      <PageContainer aria-labelledby="projects-page-title">
        <PageHeader>
          <div className="flex items-center gap-2">
            <PageTitle>My Projects</PageTitle>

            <ProjectFormDialog method="POST">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                aria-label="Create a new project">
                <Plus aria-hidden="true" />
              </Button>
            </ProjectFormDialog>
          </div>

          <fetcher.Form
            method="get"
            action={ROUTES.PROJECTS}
            role="search">
            <ProjectSearchField
              onChange={handleSearchChange}
              isLoading={isIdle}
            />
          </fetcher.Form>
        </PageHeader>

        <PageList aria-label="Project list">
          <div className="h-8 flex items-center border-b mb-1">
            <TotalCounter
              totalCount={total}
              label="project"
              icon={FolderKanban}
            />
          </div>

          <div className={cn(isSearching && 'opacity-25')}>
            {visibleProjects.map((project, index) => (
              <ItemList
                key={project.$id}
                index={index}
                getClassName={getItemClassName}
                getStyle={getItemStyle}>
                <ProjectCard
                  key={project.$id}
                  project={project}
                />
              </ItemList>
            ))}

            {!total && (
              <p
                className="h-14 flex justify-center items-center text-muted-foreground"
                role="status">
                No project found
              </p>
            )}

            {hasMore && (
              <div className="flex justify-center py-6">
                <LoadMoreButton
                  loading={isLoading}
                  onClick={handleLoadMore}
                />
              </div>
            )}
          </div>
        </PageList>
      </PageContainer>
    </>
  );
};
