import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FooterNavLink } from './FooterNavLink';

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className, ...props }: Record<string, unknown>) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      className={className as string}
      {...props}
    />
  ),
}));

vi.mock('@/constants/app-links', () => ({
  SOCIAL_LINKS: [
    { href: 'https://twitter.com', label: 'Twitter' },
    { href: 'https://github.com', label: 'GitHub' },
    { href: 'https://linkedin.com', label: 'LinkedIn' },
  ],
}));

describe('FooterNavLink', () => {
  const mockLink = {
    href: 'https://twitter.com',
    label: 'Twitter',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render link with correct text', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
    });

    it('should have correct href attribute', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const link = screen.getByRole('link', { name: 'Twitter' });
      expect(link).toHaveAttribute('href', 'https://twitter.com');
    });

    it('should open link in new tab', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const link = screen.getByRole('link', { name: 'Twitter' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('separator rendering', () => {
    it('should render separator when not last item', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should not render separator when last item', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={2}
        />
      );

      expect(screen.queryByTestId('separator')).not.toBeInTheDocument();
    });

    it('should have vertical orientation on separator', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should have correct classes on separator', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-3', 'mx-3');
    });
  });

  describe('user interactions', () => {
    it('should be clickable', async () => {
      const user = userEvent.setup();
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const link = screen.getByRole('link', { name: 'Twitter' });
      await user.click(link);

      expect(link).toHaveAttribute('href', 'https://twitter.com');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const link = screen.getByRole('link', { name: 'Twitter' });
      await user.tab();

      expect(link).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on link', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const link = screen.getByRole('link', { name: 'Twitter' });
      expect(link).toHaveAttribute('aria-label', 'Twitter');
    });

    it('should hide separator from screen readers', () => {
      render(
        <FooterNavLink
          link={mockLink}
          index={0}
        />
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('role', 'presentation');
    });
  });

  describe('multiple links', () => {
    it('should render first link with separator', () => {
      const firstLink = { href: 'https://twitter.com', label: 'Twitter' };
      render(
        <FooterNavLink
          link={firstLink}
          index={0}
        />
      );

      expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should render middle link with separator', () => {
      const middleLink = { href: 'https://github.com', label: 'GitHub' };
      render(
        <FooterNavLink
          link={middleLink}
          index={1}
        />
      );

      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should render last link without separator', () => {
      const lastLink = { href: 'https://linkedin.com', label: 'LinkedIn' };
      render(
        <FooterNavLink
          link={lastLink}
          index={2}
        />
      );

      expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
      expect(screen.queryByTestId('separator')).not.toBeInTheDocument();
    });
  });
});
