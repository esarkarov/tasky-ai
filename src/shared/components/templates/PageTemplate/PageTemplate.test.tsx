import {
  PageContainer,
  PageHeader,
  PageList,
  PageTitle,
} from '@/shared/components/templates/PageTemplate/PageTemplate';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PageTemplate Components', () => {
  const renderWithChildren = (Component: React.FC<React.PropsWithChildren>, text = 'Test Content') =>
    render(
      <Component>
        <div>{text}</div>
      </Component>
    );

  describe('PageContainer', () => {
    it('renders its children inside a main element', () => {
      renderWithChildren(PageContainer);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveTextContent('Test Content');
    });

    it('has correct attributes and styling', () => {
      renderWithChildren(PageContainer);
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Page content');
      expect(main).toHaveClass('container', 'md:max-w-screen-lg');
    });

    it('has a defined display name', () => {
      expect(PageContainer.displayName).toBe('PageContainer');
    });
  });

  describe('PageHeader', () => {
    it('renders children inside a header element', () => {
      renderWithChildren(PageHeader);
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Test Content');
    });

    it('has correct accessibility attributes', () => {
      renderWithChildren(PageHeader);
      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('aria-label', 'Page header');
    });

    it('has correct styling classes', () => {
      renderWithChildren(PageHeader);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('pt-2', 'pb-3', 'space-y-2', 'md:px-4', 'lg:px-10', 'animate-fade-in', 'opacity-0');
    });

    it('has a defined display name', () => {
      expect(PageHeader.displayName).toBe('PageHeader');
    });
  });

  describe('PageTitle', () => {
    it('renders text as an h1 heading', () => {
      render(<PageTitle>Page Title</PageTitle>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Page Title');
    });

    it('has correct id and styling classes', () => {
      render(<PageTitle>Page Title</PageTitle>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'page-title');
      expect(heading).toHaveClass('text-2xl', 'font-semibold');
    });

    it('has a defined display name', () => {
      expect(PageTitle.displayName).toBe('PageTitle');
    });
  });

  describe('PageList', () => {
    it('renders children inside a section element', () => {
      renderWithChildren(PageList);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveTextContent('Test Content');
    });

    it('links to page title for accessibility', () => {
      renderWithChildren(PageList);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'page-title');
    });

    it('has correct styling classes', () => {
      renderWithChildren(PageList);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('pt-2', 'pb-20', 'md:px-4', 'lg:px-10');
    });

    it('has a defined display name', () => {
      expect(PageList.displayName).toBe('PageList');
    });
  });

  describe('component composition', () => {
    it('renders a complete page structure correctly', () => {
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

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Test Page' })).toBeInTheDocument();
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('maintains correct ARIA relationships between title and list', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>Accessible Title</PageTitle>
          </PageHeader>
          <PageList>
            <div>Content</div>
          </PageList>
        </PageContainer>
      );

      const title = screen.getByRole('heading', { level: 1 });
      const section = screen.getByRole('region');
      expect(title).toHaveAttribute('id', 'page-title');
      expect(section).toHaveAttribute('aria-labelledby', 'page-title');
    });
  });

  describe('accessibility', () => {
    it('renders proper semantic HTML structure', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>Accessible Page</PageTitle>
          </PageHeader>
          <PageList>
            <div>Content</div>
          </PageList>
        </PageContainer>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('ensures ARIA labels are correctly applied', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>ARIA Test</PageTitle>
          </PageHeader>
          <PageList>
            <div>Content</div>
          </PageList>
        </PageContainer>
      );

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Page content');
      expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Page header');
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'page-title');
    });
  });

  describe('memoization behavior', () => {
    it('does not re-render when props remain unchanged', () => {
      const { rerender } = renderWithChildren(PageContainer, 'Static Content');
      const firstRender = screen.getByRole('main');

      rerender(
        <PageContainer>
          <div>Static Content</div>
        </PageContainer>
      );

      const secondRender = screen.getByRole('main');
      expect(firstRender).toBe(secondRender);
    });

    it('re-renders when children change', () => {
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
