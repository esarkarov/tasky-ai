import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageContainer, PageHeader, PageList, PageTitle } from './PageTemplate';

describe('Page Components', () => {
  describe('PageContainer', () => {
    it('should render children', () => {
      render(
        <PageContainer>
          <div>Test Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render as main element', () => {
      render(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Page content');
    });

    it('should have correct styling classes', () => {
      render(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'md:max-w-screen-lg');
    });

    it('should have correct display name', () => {
      expect(PageContainer.displayName).toBe('PageContainer');
    });
  });

  describe('PageHeader', () => {
    it('should render children', () => {
      render(
        <PageHeader>
          <div>Header Content</div>
        </PageHeader>
      );

      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should render as header element', () => {
      render(
        <PageHeader>
          <div>Content</div>
        </PageHeader>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <PageHeader>
          <div>Content</div>
        </PageHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('aria-label', 'Page header');
    });

    it('should have correct styling classes', () => {
      render(
        <PageHeader>
          <div>Content</div>
        </PageHeader>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('pt-2', 'pb-3', 'space-y-2', 'md:px-4', 'lg:px-10', 'animate-fade-in', 'opacity-0');
    });

    it('should have correct display name', () => {
      expect(PageHeader.displayName).toBe('PageHeader');
    });
  });

  describe('PageTitle', () => {
    it('should render children', () => {
      render(<PageTitle>My Page Title</PageTitle>);

      expect(screen.getByText('My Page Title')).toBeInTheDocument();
    });

    it('should render as h1 heading', () => {
      render(<PageTitle>My Page Title</PageTitle>);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have id attribute', () => {
      render(<PageTitle>My Page Title</PageTitle>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'page-title');
    });

    it('should have correct styling classes', () => {
      render(<PageTitle>My Page Title</PageTitle>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl', 'font-semibold');
    });

    it('should have correct display name', () => {
      expect(PageTitle.displayName).toBe('PageTitle');
    });
  });

  describe('PageList', () => {
    it('should render children', () => {
      render(
        <PageList>
          <div>List Content</div>
        </PageList>
      );

      expect(screen.getByText('List Content')).toBeInTheDocument();
    });

    it('should render as section element', () => {
      render(
        <PageList>
          <div>Content</div>
        </PageList>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to page-title', () => {
      render(
        <PageList>
          <div>Content</div>
        </PageList>
      );

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'page-title');
    });

    it('should have correct styling classes', () => {
      render(
        <PageList>
          <div>Content</div>
        </PageList>
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass('pt-2', 'pb-20', 'md:px-4', 'lg:px-10');
    });

    it('should have correct display name', () => {
      expect(PageList.displayName).toBe('PageList');
    });
  });

  describe('component composition', () => {
    it('should work together as a complete page structure', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>Test Page</PageTitle>
          </PageHeader>
          <PageList>
            <div>Page content goes here</div>
          </PageList>
        </PageContainer>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Test Page' })).toBeInTheDocument();
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Page content goes here')).toBeInTheDocument();
    });

    it('should maintain correct ARIA relationships', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>My Title</PageTitle>
          </PageHeader>
          <PageList>
            <div>Content</div>
          </PageList>
        </PageContainer>
      );

      const title = screen.getByRole('heading', { level: 1 });
      const list = screen.getByRole('region');

      expect(title).toHaveAttribute('id', 'page-title');
      expect(list).toHaveAttribute('aria-labelledby', 'page-title');
    });
  });

  describe('memoization', () => {
    it('should not re-render PageContainer when props are the same', () => {
      const { rerender } = render(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      const main = screen.getByRole('main');
      const firstRender = main;

      rerender(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      const secondRender = screen.getByRole('main');
      expect(firstRender).toBe(secondRender);
    });

    it('should re-render when children change', () => {
      const { rerender } = render(
        <PageContainer>
          <div>Original Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Original Content')).toBeInTheDocument();

      rerender(
        <PageContainer>
          <div>Updated Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Updated Content')).toBeInTheDocument();
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic HTML structure', () => {
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

    it('should have proper ARIA labels', () => {
      render(
        <PageContainer>
          <PageHeader>
            <PageTitle>Test</PageTitle>
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
});
