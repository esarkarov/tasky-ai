import { EmptyStateMessage } from '@/shared/components/organisms/EmptyStateMessage/EmptyStateMessage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('EmptyStateMessage', () => {
  describe('rendering', () => {
    it('should render with image, title, and description', () => {
      render(<EmptyStateMessage variant="today" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByAltText('today empty image')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'What do you need to get done today?' })).toBeInTheDocument();
      expect(
        screen.getByText('By default, tasks added here will be due today. Click + to add a task.')
      ).toBeInTheDocument();
    });

    it('should render without image when not provided', () => {
      render(<EmptyStateMessage variant="upcoming" />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Plan ahead with ease!' })).toBeInTheDocument();
      expect(
        screen.getByText('Tasks added here will be due in the future. Click + to schedule a task.')
      ).toBeInTheDocument();
    });

    it('should render image with correct attributes', () => {
      render(<EmptyStateMessage variant="project" />);

      const img = screen.getByAltText('project empty image');
      expect(img).toHaveAttribute('src', '/empty-state/project-task-empty-state.png');
      expect(img).toHaveAttribute('width', '228');
      expect(img).toHaveAttribute('height', '260');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<EmptyStateMessage variant="inbox" />);

      const section = screen.getByRole('status');
      expect(section).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide image from screen readers', () => {
      render(<EmptyStateMessage variant="inbox" />);

      const img = screen.getByAltText('inbox empty image');
      expect(img).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have screen reader only caption', () => {
      const { container } = render(<EmptyStateMessage variant="inbox" />);

      const figcaption = container.querySelector('figcaption');
      expect(figcaption).toHaveClass('sr-only');
      expect(figcaption).toHaveTextContent('What is on your mind?');
    });
  });

  describe('component behavior', () => {
    it('should have displayName set', () => {
      expect(EmptyStateMessage.displayName).toBe('EmptyStateMessage');
    });

    it('should render different variants correctly', () => {
      const { rerender } = render(<EmptyStateMessage variant="today" />);
      expect(screen.getByRole('heading', { name: 'What do you need to get done today?' })).toBeInTheDocument();

      rerender(<EmptyStateMessage variant="inbox" />);
      expect(screen.getByRole('heading', { name: 'What is on your mind?' })).toBeInTheDocument();

      rerender(<EmptyStateMessage variant="completed" />);
      expect(screen.getByRole('heading', { name: 'You have been productive!' })).toBeInTheDocument();
    });
  });
});
