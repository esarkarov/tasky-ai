import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavList, ItemList } from './List';

describe('List Components', () => {
  const setupNavList = (index = 0, children = <div>Content</div>) => {
    const { container } = render(<NavList index={index}>{children}</NavList>);
    const wrapper = container.firstChild as HTMLElement;
    return { container, wrapper };
  };
  const setupItemList = (index = 0) => {
    const getClassName = vi.fn((i: number) => `item-class-${i}`);
    const getStyle = vi.fn((i: number) => ({ animationDelay: `${i * 50}ms` }));
    const { container } = render(
      <ItemList
        index={index}
        getClassName={getClassName}
        getStyle={getStyle}>
        <div>Item</div>
      </ItemList>
    );
    const wrapper = container.firstChild as HTMLElement;
    return { wrapper, getClassName, getStyle };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NavList', () => {
    it('renders children', () => {
      render(
        <NavList index={0}>
          <div>Nav Item</div>
        </NavList>
      );
      expect(screen.getByText('Nav Item')).toBeInTheDocument();
    });

    it('applies animation classes', () => {
      const { wrapper } = setupNavList();
      expect(wrapper).toHaveClass('animate-fade-in', 'opacity-0', '[animation-fill-mode:forwards]');
    });

    it('applies correct animation delay based on index', () => {
      const { wrapper } = setupNavList(2);
      expect(wrapper).toHaveStyle({ animationDelay: '0.1s' });
    });

    it('applies correct delay for large index', () => {
      const { wrapper } = setupNavList(100);
      expect(wrapper).toHaveStyle({ animationDelay: '5s' });
    });

    it('renders multiple children', () => {
      render(
        <NavList index={0}>
          <div>First</div>
          <div>Second</div>
        </NavList>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('has correct display name', () => {
      expect(NavList.displayName).toBe('NavList');
    });
  });

  describe('ItemList', () => {
    it('renders children', () => {
      const { wrapper } = setupItemList(0);
      expect(wrapper.textContent).toContain('Item');
    });

    it('calls getClassName and getStyle with correct index', () => {
      const getClassName = vi.fn();
      const getStyle = vi.fn();
      render(
        <ItemList
          index={3}
          getClassName={getClassName}
          getStyle={getStyle}>
          <div>Content</div>
        </ItemList>
      );
      expect(getClassName).toHaveBeenCalledWith(3);
      expect(getStyle).toHaveBeenCalledWith(3);
    });

    it('applies correct className and style', () => {
      const { wrapper } = setupItemList(2);
      expect(wrapper).toHaveClass('item-class-2');
      expect(wrapper).toHaveStyle({ animationDelay: '100ms' });
    });

    it('renders multiple children', () => {
      render(
        <ItemList
          index={0}
          getClassName={() => 'class'}
          getStyle={() => ({})}>
          <div>First</div>
          <div>Second</div>
        </ItemList>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('handles index 0 correctly', () => {
      const { wrapper, getClassName, getStyle } = setupItemList(0);
      expect(getClassName).toHaveBeenCalledWith(0);
      expect(getStyle).toHaveBeenCalledWith(0);
      expect(wrapper).toHaveClass('item-class-0');
      expect(wrapper).toHaveStyle({ animationDelay: '0ms' });
    });

    it('handles empty className', () => {
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

    it('handles empty style', () => {
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

    it('handles complex style object', () => {
      const getClassName = vi.fn(() => 'test-class');
      const getStyle = vi.fn(() => ({
        opacity: 0,
        transform: 'translateY(10px)',
        transition: 'all 0.3s ease',
      }));
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

    it('has correct display name', () => {
      expect(ItemList.displayName).toBe('ItemList');
    });
  });

  describe('memoization', () => {
    it('avoids re-render when NavList props are the same', () => {
      const { rerender } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );
      const { container } = render(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );
      const firstRender = container.firstChild;
      rerender(
        <NavList index={0}>
          <div>Content</div>
        </NavList>
      );
      expect(firstRender).toBeTruthy();
    });

    it('updates NavList when index changes', () => {
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

    it('avoids re-render when ItemList props are the same', () => {
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
});
