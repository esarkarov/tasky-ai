import { EMPTY_STATES } from '@/constants';
import { TEmptyStateType } from '@/types';

interface TaskEmptyStateProps {
  type?: TEmptyStateType;
}

export const TaskEmptyState = ({ type = 'today' }: TaskEmptyStateProps) => {
  const { img, title, description } = EMPTY_STATES[type];

  return (
    <div className='max-w-[360px] mx-auto flex flex-col items-center text-center'>
      {img && (
        <figure>
          <img
            src={img.src}
            width={img.width}
            height={img.height}
            alt={title}
          />
        </figure>
      )}

      <div className='mt-4 mb-2'>{title}</div>

      <p className='text-sm text-muted-foreground px-4'>{description}</p>
    </div>
  );
};
