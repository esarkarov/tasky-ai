import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const defaultLink = { href: 'https://twitter.com', label: 'Twitter' };
  const setup = async (index = 0, link = { href: 'https://twitter.com', label: 'Twitter' }) => {
    const user = userEvent.setup();
    render(
      <FooterNavLink
        link={link}
        index={index}
      />
    );
    const navLink = screen.getByRole('link', { name: link.label });
    const separator = screen.queryByTestId('separator');
    return { user, navLink, separator };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders link with correct text and href', async () => {
      const { navLink } = await setup(0, defaultLink);

      expect(navLink).toBeInTheDocument();
      expect(navLink).toHaveTextContent('Twitter');
      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
    });

    it('opens link in a new tab with safe rel attributes', async () => {
      const { navLink } = await setup();

      expect(navLink).toHaveAttribute('target', '_blank');
      expect(navLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('separator rendering', () => {
    it('renders separator when not the last item', async () => {
      const { separator } = await setup(0);

      expect(separator).toBeInTheDocument();
    });

    it('does not render separator for the last item', async () => {
      const { separator } = await setup(2);

      expect(separator).not.toBeInTheDocument();
    });

    it('sets vertical orientation and correct classes on separator', async () => {
      const { separator } = await setup(1);

      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveClass('h-3', 'mx-3');
    });
  });

  describe('user interactions', () => {
    it('is clickable and navigates to correct href', async () => {
      const { user, navLink } = await setup();

      await user.click(navLink);

      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
    });

    it('is keyboard accessible via Tab', async () => {
      const { user, navLink } = await setup();

      await user.tab();

      expect(navLink).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it('adds aria-label for assistive technologies', async () => {
      const { navLink } = await setup();

      expect(navLink).toHaveAttribute('aria-label', 'Twitter');
    });

    it('hides separator from screen readers', async () => {
      const { separator } = await setup(0);

      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('role', 'presentation');
    });
  });

  describe('multiple links behavior', () => {
    it('renders first link with separator', async () => {
      const { separator, navLink } = await setup(0, { href: 'https://twitter.com', label: 'Twitter' });

      expect(navLink).toBeInTheDocument();
      expect(separator).toBeInTheDocument();
    });

    it('renders middle link with separator', async () => {
      const { separator, navLink } = await setup(1, { href: 'https://github.com', label: 'GitHub' });

      expect(navLink).toHaveTextContent('GitHub');
      expect(separator).toBeInTheDocument();
    });

    it('renders last link without separator', async () => {
      const { navLink, separator } = await setup(2, { href: 'https://linkedin.com', label: 'LinkedIn' });

      expect(navLink).toHaveTextContent('LinkedIn');
      expect(separator).not.toBeInTheDocument();
    });
  });
});
