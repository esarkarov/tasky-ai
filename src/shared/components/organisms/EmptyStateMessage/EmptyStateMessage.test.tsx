import { EmptyStateMessage } from '@/shared/components/organisms/EmptyStateMessage/EmptyStateMessage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('EmptyStateMessage', () => {
  describe('basic rendering', () => {
    it('should render with image, title, description, and correct attributes', () => {
      render(<EmptyStateMessage variant="today" />);

      const section = screen.getByRole('status');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-live', 'polite');

      expect(screen.getByRole('heading', { name: 'What do you need to get done today?' })).toBeInTheDocument();
      expect(
        screen.getByText('By default, tasks added here will be due today. Click + to add a task.')
      ).toBeInTheDocument();

      const img = screen.getByAltText('today empty image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/empty-state/today-task-empty-state.png');
      expect(img).toHaveAttribute('width', '226');
      expect(img).toHaveAttribute('height', '260');
      expect(img).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render without image when variant has no image', () => {
      render(<EmptyStateMessage variant="upcoming" />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Plan ahead with ease!' })).toBeInTheDocument();
      expect(
        screen.getByText('Tasks added here will be due in the future. Click + to schedule a task.')
      ).toBeInTheDocument();
    });

    it('should have displayName', () => {
      expect(EmptyStateMessage.displayName).toBe('EmptyStateMessage');
    });
  });

  describe('accessibility', () => {
    it('should have screen reader only caption for image', () => {
      const { container } = render(<EmptyStateMessage variant="inbox" />);

      const figcaption = container.querySelector('figcaption');
      expect(figcaption).toHaveClass('sr-only');
      expect(figcaption).toHaveTextContent('What is on your mind?');
    });
  });

  describe('variants', () => {
    it('should render different variants correctly', () => {
      const { rerender } = render(<EmptyStateMessage variant="today" />);
      expect(screen.getByRole('heading', { name: 'What do you need to get done today?' })).toBeInTheDocument();

      rerender(<EmptyStateMessage variant="inbox" />);
      expect(screen.getByRole('heading', { name: 'What is on your mind?' })).toBeInTheDocument();

      rerender(<EmptyStateMessage variant="completed" />);
      expect(screen.getByRole('heading', { name: 'You have been productive!' })).toBeInTheDocument();

      rerender(<EmptyStateMessage variant="project" />);
      const img = screen.getByAltText('project empty image');
      expect(img).toHaveAttribute('src', '/empty-state/project-task-empty-state.png');
      expect(img).toHaveAttribute('width', '228');
      expect(img).toHaveAttribute('height', '260');
    });
  });
});
