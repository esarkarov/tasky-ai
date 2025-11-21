import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FooterNavLink } from './FooterNavLink';

vi.mock('@/shared/components/ui/separator', () => ({
  Separator: ({ orientation, className, ...props }: Record<string, unknown>) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      className={className as string}
      {...props}
    />
  ),
}));

describe('FooterNavLink', () => {
  const mockLink = {
    href: 'https://twitter.com',
    label: 'Twitter',
  };

  const setup = (link = mockLink, isLast = false) => {
    const user = userEvent.setup();
    render(
      <FooterNavLink
        link={link}
        isLast={isLast}
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
    it('renders link with correct text and href', () => {
      const { navLink } = setup();

      expect(navLink).toBeInTheDocument();
      expect(navLink).toHaveTextContent('Twitter');
      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
    });

    it('renders link with custom data', () => {
      const customLink = { href: 'https://github.com', label: 'GitHub' };
      const { navLink } = setup(customLink);

      expect(navLink).toHaveTextContent('GitHub');
      expect(navLink).toHaveAttribute('href', 'https://github.com');
    });

    it('opens link in a new tab with safe rel attributes', () => {
      const { navLink } = setup();

      expect(navLink).toHaveAttribute('target', '_blank');
      expect(navLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('separator rendering', () => {
    it('renders separator when isLast is false', () => {
      const { separator } = setup(mockLink, false);

      expect(separator).toBeInTheDocument();
    });

    it('does not render separator when isLast is true', () => {
      const { separator } = setup(mockLink, true);

      expect(separator).not.toBeInTheDocument();
    });

    it('hides separator from screen readers', () => {
      const { separator } = setup(mockLink, false);

      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('role', 'presentation');
    });
  });

  describe('user interactions', () => {
    it('is clickable and has correct href', async () => {
      const { user, navLink } = setup();

      await user.click(navLink);

      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
    });

    it('is keyboard accessible via Tab', async () => {
      const { user, navLink } = setup();

      await user.tab();

      expect(navLink).toHaveFocus();
    });

    it('can be activated with Enter key', async () => {
      const { user, navLink } = setup();

      navLink.focus();
      await user.keyboard('{Enter}');

      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label', () => {
      const { navLink } = setup();

      expect(navLink).toHaveAttribute('aria-label', 'Twitter');
    });

    it('provides semantic link role', () => {
      setup();

      const link = screen.getByRole('link', { name: 'Twitter' });
      expect(link).toBeInTheDocument();
    });

    it('announces link properly to screen readers', () => {
      const { navLink } = setup();

      expect(navLink).toHaveAccessibleName('Twitter');
    });
  });

  describe('multiple links simulation', () => {
    it('renders first link (not last) with separator', () => {
      const { navLink, separator } = setup({ href: 'https://twitter.com', label: 'Twitter' }, false);

      expect(navLink).toBeInTheDocument();
      expect(separator).toBeInTheDocument();
    });

    it('renders middle link (not last) with separator', () => {
      const { navLink, separator } = setup({ href: 'https://github.com', label: 'GitHub' }, false);

      expect(navLink).toHaveTextContent('GitHub');
      expect(separator).toBeInTheDocument();
    });

    it('renders last link without separator', () => {
      const { navLink, separator } = setup({ href: 'https://linkedin.com', label: 'LinkedIn' }, true);

      expect(navLink).toHaveTextContent('LinkedIn');
      expect(separator).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles link with special characters in label', () => {
      const specialLink = {
        href: 'https://example.com',
        label: 'Test & Demo',
      };
      const { navLink } = setup(specialLink);

      expect(navLink).toHaveTextContent('Test & Demo');
    });

    it('handles very long URLs', () => {
      const longLink = {
        href: 'https://example.com/very/long/path/to/resource?param1=value1&param2=value2',
        label: 'Long URL',
      };
      const { navLink } = setup(longLink);

      expect(navLink).toHaveAttribute('href', longLink.href);
    });

    it('wraps content in list item', () => {
      const { navLink } = setup();
      const listItem = navLink.closest('li');

      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveClass('flex', 'items-center');
    });
  });
});
