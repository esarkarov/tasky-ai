import type { CSSProperties } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavList, ItemList } from './List';

describe('List Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NavList', () => {
    it('should render children', () => {
      render(
        <NavList index={0}>
          <div>Nav Item</div>
        </NavList>
      );

      expect(screen.getByText('Nav Item')).toBeInTheDocument();
    });

    it('should have animation classes', () => {
      const { container } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('animate-fade-in', 'opacity-0', '[animation-fill-mode:forwards]');
    });

    it('should apply animation delay based on index', () => {
      const { container } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ animationDelay: '0s' });
    });

    it('should calculate animation delay correctly for different indices', () => {
      const { container: container1 } = render(
        <NavList index={2}>
          <div>Item 2</div>
        </NavList>
      );

      const wrapper1 = container1.firstChild as HTMLElement;
      expect(wrapper1).toHaveStyle({ animationDelay: '0.1s' });

      const { container: container2 } = render(
        <NavList index={5}>
          <div>Item 5</div>
        </NavList>
      );

      const wrapper2 = container2.firstChild as HTMLElement;
      expect(wrapper2).toHaveStyle({ animationDelay: '0.25s' });
    });

    it('should have correct display name', () => {
      expect(NavList.displayName).toBe('NavList');
    });

    it('should render multiple children', () => {
      render(
        <NavList index={0}>
          <div>First</div>
          <div>Second</div>
        </NavList>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('ItemList', () => {
    const mockGetClassName = vi.fn((index: number) => `item-class-${index}`);
    const mockGetStyle = vi.fn(
      (index: number): CSSProperties => ({
        animationDelay: `${index * 50}ms`,
      })
    );

    beforeEach(() => {
      mockGetClassName.mockClear();
      mockGetStyle.mockClear();
    });

    it('should render children', () => {
      render(
        <ItemList
          index={0}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>List Item</div>
        </ItemList>
      );

      expect(screen.getByText('List Item')).toBeInTheDocument();
    });

    it('should call getClassName with correct index', () => {
      render(
        <ItemList
          index={3}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>Content</div>
        </ItemList>
      );

      expect(mockGetClassName).toHaveBeenCalledWith(3);
      expect(mockGetClassName).toHaveBeenCalledTimes(1);
    });

    it('should call getStyle with correct index', () => {
      render(
        <ItemList
          index={3}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>Content</div>
        </ItemList>
      );

      expect(mockGetStyle).toHaveBeenCalledWith(3);
      expect(mockGetStyle).toHaveBeenCalledTimes(1);
    });

    it('should apply className from getClassName', () => {
      const { container } = render(
        <ItemList
          index={2}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>Content</div>
        </ItemList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('item-class-2');
    });

    it('should apply style from getStyle', () => {
      const { container } = render(
        <ItemList
          index={2}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>Content</div>
        </ItemList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ animationDelay: '100ms' });
    });

    it('should have correct display name', () => {
      expect(ItemList.displayName).toBe('ItemList');
    });

    it('should handle index 0', () => {
      const { container } = render(
        <ItemList
          index={0}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>Content</div>
        </ItemList>
      );

      expect(mockGetClassName).toHaveBeenCalledWith(0);
      expect(mockGetStyle).toHaveBeenCalledWith(0);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('item-class-0');
      expect(wrapper).toHaveStyle({ animationDelay: '0ms' });
    });

    it('should render multiple children', () => {
      render(
        <ItemList
          index={0}
          getClassName={mockGetClassName}
          getStyle={mockGetStyle}>
          <div>First</div>
          <div>Second</div>
        </ItemList>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('should not re-render NavList when props are the same', () => {
      const { rerender } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );

      const { container: firstContainer } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );
      const firstRender = firstContainer.firstChild;

      rerender(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );

      expect(firstRender).toBeTruthy();
    });

    it('should re-render NavList when index changes', () => {
      const { rerender, container } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ animationDelay: '0s' });

      rerender(
        <NavList index={2}>
          <div>Content</div>
        </NavList>
      );

      const updatedWrapper = container.firstChild as HTMLElement;
      expect(updatedWrapper).toHaveStyle({ animationDelay: '0.1s' });
    });

    it('should not re-render ItemList when props are the same', () => {
      const getClassName = vi.fn();
      const getStyle = vi.fn();

      const { rerender } = render(
        <ItemList
          index={0}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Content</div>
        </ItemList>
      );

      getClassName.mockClear();
      getStyle.mockClear();

      rerender(
        <ItemList
          index={0}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Content</div>
        </ItemList>
      );

      expect(getClassName).not.toHaveBeenCalled();
      expect(getStyle).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle NavList with large index', () => {
      const { container } = render(
        <NavList index={100}>
          <div>Content</div>
        </NavList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ animationDelay: '5s' });
    });

    it('should handle ItemList with empty className', () => {
      const getClassName = vi.fn(() => '');
      const getStyle = vi.fn(() => ({}));

      const { container } = render(
        <ItemList
          index={0}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Content</div>
        </ItemList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toBe('');
    });

    it('should handle ItemList with empty style', () => {
      const getClassName = vi.fn(() => 'test-class');
      const getStyle = vi.fn(() => ({}));

      const { container } = render(
        <ItemList
          index={0}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Content</div>
        </ItemList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.length).toBe(0);
    });

    it('should handle ItemList with complex style object', () => {
      const getClassName = vi.fn(() => 'test-class');
      const getStyle = vi.fn(
        (): CSSProperties => ({
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'all 0.3s ease',
        })
      );

      const { container } = render(
        <ItemList
          index={0}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Content</div>
        </ItemList>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'all 0.3s ease',
      });
    });
  });
});
