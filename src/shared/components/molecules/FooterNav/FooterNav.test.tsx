import { FooterNav } from '@/shared/components/molecules/FooterNav/FooterNav';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface FooterNavLinkProps {
  link: { href: string; label: string };
  isLast?: boolean;
}

vi.mock('@/shared/components/atoms/FooterNavLink/FooterNavLink', () => ({
  FooterNavLink: ({ link }: FooterNavLinkProps) => (
    <li data-testid={`footer-nav-link-${link.label.toLowerCase()}`}>
      <a href={link.href}>{link.label}</a>
    </li>
  ),
}));

describe('FooterNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render navigation with list containing all social links', () => {
      render(<FooterNav />);

      const nav = screen.getByRole('navigation', { name: 'Social media links' });
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe('NAV');

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe('UL');
      expect(nav).toContainElement(list);
    });
  });

  describe('social links', () => {
    it('should render all social links with correct labels and hrefs', () => {
      render(<FooterNav />);

      const githubLink = screen.getByTestId('footer-nav-link-github');
      const linkedinLink = screen.getByTestId('footer-nav-link-linkedin');

      expect(githubLink).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(githubLink.querySelector('a')).toHaveAttribute('href', 'https://github.com/esarkarov');

      expect(linkedinLink).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(linkedinLink.querySelector('a')).toHaveAttribute('href', 'https://linkedin.com/in/elvinsarkarov');
    });

    it('should render correct number of list items', () => {
      const { container } = render(<FooterNav />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('should have descriptive aria-label on navigation element', () => {
      render(<FooterNav />);

      const nav = screen.getByLabelText('Social media links');
      expect(nav).toBeInTheDocument();
    });
  });
});
