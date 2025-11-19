import { EmptyStateContent, EmptyStateVariant } from '@/shared/types';
import { createEmptyState } from '@/shared/utils/ui/ui.utils';
import { memo } from 'react';

const EMPTY_STATE_CONTENTS: Record<EmptyStateVariant, EmptyStateContent> = {
  today: createEmptyState(
    '/empty-state/today-task-empty-state.png',
    226,
    'What do you need to get done today?',
    'By default, tasks added here will be due today. Click + to add a task.'
  ),
  inbox: createEmptyState(
    '/empty-state/inbox-task-empty-state.png',
    344,
    'What is on your mind?',
    "Capture tasks that don't have a specific category. Click + to add a task."
  ),
  upcoming: createEmptyState(
    '/empty-state/upcoming-task-empty-state.png',
    208,
    'Plan ahead with ease!',
    'Tasks added here will be due in the future. Click + to schedule a task.'
  ),
  completed: createEmptyState(
    '/empty-state/completed-task-empty-state.png',
    231,
    'You have been productive!',
    'All the tasks you have completed will appear here. Keep up the great work!'
  ),
  project: createEmptyState(
    '/empty-state/project-task-empty-state.png',
    228,
    "Let's build something amazing!",
    'Add tasks specific to this project. Click + to start planning.'
  ),
};

interface EmptyStateMessageProps {
  variant: EmptyStateVariant;
}

export const EmptyStateMessage = memo(({ variant }: EmptyStateMessageProps) => {
  const { img, title, description } = EMPTY_STATE_CONTENTS[variant];

  return (
    <section
      className="mx-auto flex max-w-[360px] flex-col items-center text-center"
      role="status"
      aria-live="polite">
      {img && (
        <figure className="flex flex-col items-center">
          <img
            src={img.src}
            width={img.width}
            height={img.height}
            alt={`${variant} empty image`}
            aria-hidden="true"
          />
          <figcaption className="sr-only">{title}</figcaption>
        </figure>
      )}
      <h2 className="mt-4 mb-2 text-base font-semibold">{title}</h2>
      <p className="px-4 text-sm text-muted-foreground">{description}</p>
    </section>
  );
});

EmptyStateMessage.displayName = 'EmptyStateMessage';
