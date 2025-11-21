import { ProjectActionMenu } from '@/features/projects/components/organisms/ProjectActionMenu/ProjectActionMenu';
import { ProjectListItem } from '@/features/projects/types';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { Hash, MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router';

interface ProjectCardProps {
  project: ProjectListItem;
}

export const ProjectCard = memo(({ project }: ProjectCardProps) => {
  return (
    <article
      className="group/card relative flex h-14 items-center gap-3 rounded-lg px-2 hover:bg-secondary"
      aria-label={`Project: ${project.name}`}>
      <Hash
        size={16}
        color={project.color_hex}
        className="shrink-0"
        aria-hidden="true"
      />
      <p className="max-w-[48ch] truncate text-sm">{project.name}</p>
      <ProjectActionMenu
        defaultValues={{
          id: project.$id,
          name: project.name,
          color_name: project.color_name,
          color_hex: project.color_hex,
        }}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative z-20 ms-auto shrink-0 opacity-0 group-hover/card:opacity-100 max-md:opacity-100"
          aria-label={`More actions for project ${project.name}`}>
          <MoreHorizontal
            aria-hidden="true"
            focusable="false"
          />
        </Button>
      </ProjectActionMenu>
      <Link
        to={ROUTES.PROJECT(project.$id)}
        className="absolute inset-0 z-10"
        aria-label={`Open project ${project.name}`}
      />
    </article>
  );
});

ProjectCard.displayName = 'ProjectCard';
