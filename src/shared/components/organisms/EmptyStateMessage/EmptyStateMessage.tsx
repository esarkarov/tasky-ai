import { EMPTY_STATE_CONTENTS } from '@/shared/constants/ui-contents';
import { EmptyStateVariant } from '@/shared/types';
import { memo } from 'react';

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
