import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FooterNav } from './FooterNav';

vi.mock('@/shared/components/atoms/FooterNavLink/FooterNavLink', () => ({
  FooterNavLink: ({ link, index }: { link: { href: string; label: string }; index: number }) => (
    <li data-testid={`footer-nav-link-${index}`}>
      <a href={link.href}>{link.label}</a>
    </li>
  ),
}));

vi.mock('@/shared/constants/app-links', () => ({
  SOCIAL_LINKS: [
    { href: 'https://twitter.com/example', label: 'Twitter' },
    { href: 'https://github.com/example', label: 'GitHub' },
    { href: 'https://linkedin.com/example', label: 'LinkedIn' },
  ],
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

    it('should apply correct styling classes to list', () => {
      render(<FooterNav />);

      const list = screen.getByRole('list');
      expect(list).toHaveClass('flex', 'flex-wrap', 'items-center');
    });
  });

  describe('social Links', () => {
    it('should render all social links from SOCIAL_LINKS', () => {
      render(<FooterNav />);

      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('should render FooterNavLink for each social link', () => {
      render(<FooterNav />);

      expect(screen.getByTestId('footer-nav-link-0')).toBeInTheDocument();
      expect(screen.getByTestId('footer-nav-link-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-nav-link-2')).toBeInTheDocument();
    });

    it('should pass correct props to FooterNavLink components', () => {
      render(<FooterNav />);

      const twitterLink = screen.getByTestId('footer-nav-link-0');
      const githubLink = screen.getByTestId('footer-nav-link-1');
      const linkedinLink = screen.getByTestId('footer-nav-link-2');

      expect(twitterLink.querySelector('a')).toHaveAttribute('href', 'https://twitter.com/example');
      expect(githubLink.querySelector('a')).toHaveAttribute('href', 'https://github.com/example');
      expect(linkedinLink.querySelector('a')).toHaveAttribute('href', 'https://linkedin.com/example');
    });

    it('should pass index to each FooterNavLink', () => {
      render(<FooterNav />);

      // Verify that indices are passed correctly (0, 1, 2)
      expect(screen.getByTestId('footer-nav-link-0')).toBeInTheDocument();
      expect(screen.getByTestId('footer-nav-link-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-nav-link-2')).toBeInTheDocument();
    });

    it('should use href as key for each link', () => {
      const { container } = render(<FooterNav />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
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
