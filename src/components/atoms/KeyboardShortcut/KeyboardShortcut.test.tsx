import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KeyboardShortcut } from './KeyboardShortcut';

describe('KeyboardShortcut', () => {
  describe('basic rendering', () => {
    it('should render single key', () => {
      render(<KeyboardShortcut kbdList={['Ctrl']} />);

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
    });

    it('should render multiple keys', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', 'Shift', 'P']} />);

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should render each key in kbd element', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', 'K']} />);

      const kbdElements = document.querySelectorAll('kbd');
      expect(kbdElements).toHaveLength(2);
    });

    it('should render screen reader text', () => {
      render(<KeyboardShortcut kbdList={['Ctrl']} />);

      expect(screen.getByText('Keyboard shortcut:')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have sr-only class on description text', () => {
      const { container } = render(<KeyboardShortcut kbdList={['Ctrl']} />);

      const srOnly = container.querySelector('.sr-only');
      expect(srOnly).toBeInTheDocument();
      expect(srOnly).toHaveTextContent('Keyboard shortcut:');
    });

    it('should have aria-label on each kbd element', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', 'Shift', 'K']} />);

      const ctrlKbd = screen.getByText('Ctrl');
      const shiftKbd = screen.getByText('Shift');
      const kKbd = screen.getByText('K');

      expect(ctrlKbd).toHaveAttribute('aria-label', 'Ctrl');
      expect(shiftKbd).toHaveAttribute('aria-label', 'Shift');
      expect(kKbd).toHaveAttribute('aria-label', 'K');
    });
  });

  describe('different key combinations', () => {
    it('should render common shortcut Ctrl+C', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', 'C']} />);

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should render three-key combination', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', 'Shift', 'P']} />);

      const kbdElements = document.querySelectorAll('kbd');
      expect(kbdElements).toHaveLength(3);
    });

    it('should render special keys', () => {
      render(<KeyboardShortcut kbdList={['⌘', '⇧', 'K']} />);

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('⇧')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should render function keys', () => {
      render(<KeyboardShortcut kbdList={['F1']} />);

      expect(screen.getByText('F1')).toBeInTheDocument();
    });

    it('should render arrow keys', () => {
      render(<KeyboardShortcut kbdList={['↑', '↓', '←', '→']} />);

      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('←')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const { container } = render(<KeyboardShortcut kbdList={[]} />);

      const kbdElements = container.querySelectorAll('kbd');
      expect(kbdElements).toHaveLength(0);
    });

    it('should handle single character keys', () => {
      render(<KeyboardShortcut kbdList={['A', 'B', 'C']} />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should handle long key names', () => {
      render(<KeyboardShortcut kbdList={['Control', 'Alternate', 'Delete']} />);

      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Alternate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should handle numbers', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', '1']} />);

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render keys with correct index as key prop', () => {
      render(<KeyboardShortcut kbdList={['Ctrl', 'K']} />);

      const kbdElements = document.querySelectorAll('kbd');
      expect(kbdElements).toHaveLength(2);
      expect(kbdElements[0]).toHaveTextContent('Ctrl');
      expect(kbdElements[1]).toHaveTextContent('K');
    });
  });

  describe('multiple instances', () => {
    it('should render multiple keyboard shortcuts independently', () => {
      const { container } = render(
        <>
          <KeyboardShortcut kbdList={['Ctrl', 'C']} />
          <KeyboardShortcut kbdList={['Ctrl', 'V']} />
        </>
      );

      const kbdElements = container.querySelectorAll('kbd');
      expect(kbdElements).toHaveLength(4);
    });

    it('should maintain separate sr-only text for each instance', () => {
      const { container } = render(
        <>
          <KeyboardShortcut kbdList={['Ctrl', 'C']} />
          <KeyboardShortcut kbdList={['Ctrl', 'V']} />
        </>
      );

      const srOnlyElements = container.querySelectorAll('.sr-only');
      expect(srOnlyElements).toHaveLength(2);
    });
  });
});
