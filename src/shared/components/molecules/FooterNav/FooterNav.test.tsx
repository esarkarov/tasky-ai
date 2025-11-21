import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FooterNav } from './FooterNav';

vi.mock('@/shared/components/atoms/FooterNavLink/FooterNavLink', () => ({
  FooterNavLink: ({ link }: { link: { href: string; label: string } }) => (
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
    it('should render navigation element with proper aria-label', () => {
      render(<FooterNav />);

      const nav = screen.getByRole('navigation', { name: 'Social media links' });
      expect(nav).toBeInTheDocument();
    });

    it('should render an unordered list', () => {
      render(<FooterNav />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe('UL');
    });
  });

  describe('social Links', () => {
    it('should render all social links from SOCIAL_LINKS', () => {
      render(<FooterNav />);

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('should render FooterNavLink for each social link', () => {
      render(<FooterNav />);

      expect(screen.getByTestId('footer-nav-link-github')).toBeInTheDocument();
      expect(screen.getByTestId('footer-nav-link-linkedin')).toBeInTheDocument();
    });

    it('should pass correct props to FooterNavLink components', () => {
      render(<FooterNav />);

      const githubLink = screen.getByTestId('footer-nav-link-github');
      const linkedinLink = screen.getByTestId('footer-nav-link-linkedin');

      expect(githubLink.querySelector('a')).toHaveAttribute('href', 'https://github.com/esarkarov');
      expect(linkedinLink.querySelector('a')).toHaveAttribute('href', 'https://linkedin.com/in/elvinsarkarov');
    });

    it('should pass index to each FooterNavLink', () => {
      render(<FooterNav />);

      expect(screen.getByTestId('footer-nav-link-github')).toBeInTheDocument();
      expect(screen.getByTestId('footer-nav-link-linkedin')).toBeInTheDocument();
    });

    it('should use href as key for each link', () => {
      const { container } = render(<FooterNav />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('should have semantic nav element', () => {
      render(<FooterNav />);

      const nav = screen.getByRole('navigation');
      expect(nav.tagName).toBe('NAV');
    });

    it('should have descriptive aria-label for navigation', () => {
      render(<FooterNav />);

      const nav = screen.getByLabelText('Social media links');
      expect(nav).toBeInTheDocument();
    });

    it('should use list structure for better screen reader support', () => {
      render(<FooterNav />);

      const nav = screen.getByRole('navigation');
      const list = screen.getByRole('list');

      expect(nav).toContainElement(list);
    });
  });
});
