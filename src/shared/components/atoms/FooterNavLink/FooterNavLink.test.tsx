import { FooterNavLink } from '@/shared/components/atoms/FooterNavLink/FooterNavLink';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  interface RenderOptions {
    href?: string;
    label?: string;
    isLast?: boolean;
  }

  const renderComponent = ({ href = 'https://twitter.com', label = 'Twitter', isLast = false }: RenderOptions = {}) => {
    return render(
      <FooterNavLink
        link={{ href, label }}
        isLast={isLast}
      />
    );
  };

  const getNavLink = (label: string) => screen.getByRole('link', { name: label });
  const getSeparator = () => screen.queryByTestId('separator');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render link with correct text, href, and safe rel attributes', () => {
      renderComponent();

      const navLink = getNavLink('Twitter');
      expect(navLink).toBeInTheDocument();
      expect(navLink).toHaveTextContent('Twitter');
      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
      expect(navLink).toHaveAttribute('target', '_blank');
      expect(navLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(navLink).toHaveAttribute('aria-label', 'Twitter');
    });

    it('should render link with custom data', () => {
      renderComponent({ href: 'https://github.com', label: 'GitHub' });

      const navLink = getNavLink('GitHub');
      expect(navLink).toHaveTextContent('GitHub');
      expect(navLink).toHaveAttribute('href', 'https://github.com');
    });

    it('should wrap content in list item with correct classes', () => {
      renderComponent();

      const navLink = getNavLink('Twitter');
      const listItem = navLink.closest('li');
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveClass('flex', 'items-center');
    });
  });

  describe('separator rendering', () => {
    it('should render separator with accessibility attributes when isLast is false', () => {
      renderComponent({ isLast: false });

      const separator = getSeparator();
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('role', 'presentation');
    });

    it('should not render separator when isLast is true', () => {
      renderComponent({ isLast: true });

      expect(getSeparator()).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should be keyboard accessible and activatable', async () => {
      const user = userEvent.setup();
      renderComponent();

      const navLink = getNavLink('Twitter');

      await user.tab();
      expect(navLink).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(navLink).toHaveAttribute('href', 'https://twitter.com');
    });
  });

  describe('edge cases', () => {
    it('should handle link with special characters in label', () => {
      renderComponent({ label: 'Test & Demo', href: 'https://example.com' });

      expect(getNavLink('Test & Demo')).toHaveTextContent('Test & Demo');
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/very/long/path/to/resource?param1=value1&param2=value2';
      renderComponent({ href: longUrl, label: 'Long URL' });

      expect(getNavLink('Long URL')).toHaveAttribute('href', longUrl);
    });
  });
});
