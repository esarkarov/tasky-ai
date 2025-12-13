import { ItemList, NavList } from '@/shared/components/atoms/List/List';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('List Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NavList', () => {
    interface RenderOptions {
      index?: number;
      children?: React.ReactNode;
    }

    const renderNavList = ({ index = 0, children = <div>Content</div> }: RenderOptions = {}) => {
      return render(<NavList index={index}>{children}</NavList>);
    };

    const getWrapper = (container: HTMLElement) => container.firstChild as HTMLElement;

    it('should render children with animation classes and correct delay', () => {
      const { container } = renderNavList({ index: 0, children: <div>Nav Item</div> });

      expect(screen.getByText('Nav Item')).toBeInTheDocument();
      const wrapper = getWrapper(container);
      expect(wrapper).toHaveClass('animate-fade-in', 'opacity-0', '[animation-fill-mode:forwards]');
      expect(wrapper).toHaveStyle({ animationDelay: '0s' });
    });

    it('should apply correct animation delay based on index', () => {
      const { container: container1 } = renderNavList({ index: 2 });
      expect(getWrapper(container1)).toHaveStyle({ animationDelay: '0.1s' });

      const { container: container2 } = renderNavList({ index: 100 });
      expect(getWrapper(container2)).toHaveStyle({ animationDelay: '5s' });
    });

    it('should render multiple children', () => {
      renderNavList({
        children: (
          <>
            <div>First</div>
            <div>Second</div>
          </>
        ),
      });

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should update animation delay when index changes', () => {
      const { rerender, container } = renderNavList({ index: 0 });
      expect(getWrapper(container)).toHaveStyle({ animationDelay: '0s' });

      rerender(
        <NavList index={2}>
          <div>Content</div>
        </NavList>
      );
      expect(getWrapper(container)).toHaveStyle({ animationDelay: '0.1s' });
    });

    it('should have correct displayName', () => {
      expect(NavList.displayName).toBe('NavList');
    });
  });

  describe('ItemList', () => {
    interface RenderOptions {
      index?: number;
      getClassName?: (index: number) => string;
      getStyle?: (index: number) => React.CSSProperties;
      children?: React.ReactNode;
    }

    const defaultGetClassName = (i: number) => `item-class-${i}`;
    const defaultGetStyle = (i: number) => ({ animationDelay: `${i * 50}ms` });

    const renderItemList = ({
      index = 0,
      getClassName = defaultGetClassName,
      getStyle = defaultGetStyle,
      children = <div>Item</div>,
    }: RenderOptions = {}) => {
      return render(
        <ItemList
          index={index}
          getClassName={getClassName}
          getStyle={getStyle}>
          {children}
        </ItemList>
      );
    };

    const getWrapper = (container: HTMLElement) => container.firstChild as HTMLElement;

    it('should render children with className and style from callbacks', () => {
      const getClassName = vi.fn(defaultGetClassName);
      const getStyle = vi.fn(defaultGetStyle);
      const { container } = renderItemList({ index: 2, getClassName, getStyle });

      expect(screen.getByText('Item')).toBeInTheDocument();
      expect(getClassName).toHaveBeenCalledWith(2);
      expect(getStyle).toHaveBeenCalledWith(2);

      const wrapper = getWrapper(container);
      expect(wrapper).toHaveClass('item-class-2');
      expect(wrapper).toHaveStyle({ animationDelay: '100ms' });
    });

    it('should handle index 0 correctly', () => {
      const getClassName = vi.fn(defaultGetClassName);
      const getStyle = vi.fn(defaultGetStyle);
      const { container } = renderItemList({ index: 0, getClassName, getStyle });

      expect(getClassName).toHaveBeenCalledWith(0);
      expect(getStyle).toHaveBeenCalledWith(0);
      expect(getWrapper(container)).toHaveClass('item-class-0');
      expect(getWrapper(container)).toHaveStyle({ animationDelay: '0ms' });
    });

    it('should render multiple children', () => {
      renderItemList({
        children: (
          <>
            <div>First</div>
            <div>Second</div>
          </>
        ),
      });

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should handle empty className and style', () => {
      const { container } = renderItemList({
        getClassName: () => '',
        getStyle: () => ({}),
      });

      const wrapper = getWrapper(container);
      expect(wrapper.className).toBe('');
      expect(wrapper.style.length).toBe(0);
    });

    it('should handle complex style object', () => {
      const { container } = renderItemList({
        getClassName: () => 'test-class',
        getStyle: () => ({
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'all 0.3s ease',
        }),
      });

      const wrapper = getWrapper(container);
      expect(wrapper).toHaveStyle({
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'all 0.3s ease',
      });
    });

    it('should not call callbacks again when props are the same (memoization)', () => {
      const getClassName = vi.fn(defaultGetClassName);
      const getStyle = vi.fn(defaultGetStyle);

      const { rerender } = renderItemList({ index: 0, getClassName, getStyle });

      getClassName.mockClear();
      getStyle.mockClear();

      rerender(
        <ItemList
          index={0}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Item</div>
        </ItemList>
      );

      expect(getClassName).not.toHaveBeenCalled();
      expect(getStyle).not.toHaveBeenCalled();
    });

    it('should have correct displayName', () => {
      expect(ItemList.displayName).toBe('ItemList');
    });
  });
});
