import {
  PageContainer,
  PageHeader,
  PageList,
  PageTitle,
} from '@/shared/components/templates/PageTemplate/PageTemplate';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const renderWithChildren = (Component: React.FC<React.PropsWithChildren>, text = 'Test Content') =>
  render(
    <Component>
      <div>{text}</div>
    </Component>
  );

describe('PageTemplate Components', () => {
  describe('PageContainer', () => {
    it('should render children in main element with correct attributes and styling', () => {
      renderWithChildren(PageContainer);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveTextContent('Test Content');
      expect(main).toHaveAttribute('aria-label', 'Page content');
      expect(main).toHaveClass('container', 'md:max-w-screen-lg');
    });

    it('should have displayName', () => {
      expect(PageContainer.displayName).toBe('PageContainer');
    });
  });

  describe('PageHeader', () => {
    it('should render children in header element with correct attributes and styling', () => {
      renderWithChildren(PageHeader);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Test Content');
      expect(header).toHaveAttribute('aria-label', 'Page header');
      expect(header).toHaveClass('pt-2', 'pb-3', 'space-y-2', 'md:px-4', 'lg:px-10', 'animate-fade-in', 'opacity-0');
    });

    it('should have displayName', () => {
      expect(PageHeader.displayName).toBe('PageHeader');
    });
  });

  describe('PageTitle', () => {
    it('should render as h1 heading with correct id and styling', () => {
      render(<PageTitle>Page Title</PageTitle>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Page Title');
      expect(heading).toHaveAttribute('id', 'page-title');
      expect(heading).toHaveClass('text-2xl', 'font-semibold');
    });

    it('should have displayName', () => {
      expect(PageTitle.displayName).toBe('PageTitle');
    });
  });

  describe('PageList', () => {
    it('should render children in section element with correct attributes and styling', () => {
      renderWithChildren(PageList);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveTextContent('Test Content');
      expect(section).toHaveAttribute('aria-labelledby', 'page-title');
      expect(section).toHaveClass('pt-2', 'pb-20', 'md:px-4', 'lg:px-10');
    });

    it('should have displayName', () => {
      expect(PageList.displayName).toBe('PageList');
    });
  });

  describe('component composition', () => {
    it('should render complete page structure with correct ARIA relationships', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>Test Page</PageTitle>
          </PageHeader>
          <PageList>
            <div>Page Content</div>
          </PageList>
        </PageContainer>
      );

      const main = screen.getByRole('main');
      const banner = screen.getByRole('banner');
      const title = screen.getByRole('heading', { level: 1, name: 'Test Page' });
      const section = screen.getByRole('region');

      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-label', 'Page content');

      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('aria-label', 'Page header');

      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'page-title');

      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'page-title');

      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('should re-render when children change', () => {
      const { rerender } = renderWithChildren(PageContainer, 'Initial');

      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(
        <PageContainer>
          <div>Updated</div>
        </PageContainer>
      );

      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    });
  });
});
