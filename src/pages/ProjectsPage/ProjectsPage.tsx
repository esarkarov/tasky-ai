import { Head } from '@/components/atoms/Head/Head';
import { PageContainer, PageHeader, PageList, PageTitle } from '@/components/atoms/Page/Page';
import { TotalCounter } from '@/components/atoms/TotalCounter/TotalCounter';
import { ProjectSearchField } from '@/components/molecules/ProjectSearchField';
import { ProjectCard } from '@/components/organisms/ProjectCard';
import { ProjectFormDialog } from '@/components/organisms/ProjectFormDialog';
import { TopAppBar } from '@/components/organisms/TopAppBar';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useProjectOperations } from '@/hooks/use-project-operations';
import { cn } from '@/utils/ui/ui.utils';
import { ProjectsLoaderData } from '@/types/loaders.types';
import { FolderKanban, Plus } from 'lucide-react';
import { useLoaderData } from 'react-router';
import { useLoadMore } from '@/hooks/use-load-more';
import { LoadMoreButton } from '@/components/atoms/LoadMoreButton/LoadMoreButton';
import { ItemList } from '@/components/atoms/List/List';

export const ProjectsPage = () => {
  const { fetcher, searchStatus, handleSearchProjects } = useProjectOperations();
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

      <TopAppBar
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
              onChange={handleSearchProjects}
              searchStatus={searchStatus}
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

          <div className={cn(searchStatus === 'searching' && 'opacity-25')}>
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
