import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { KeyboardShortcut } from './KeyboardShortcut';

describe('KeyboardShortcut', () => {
  const setup = (kbdList: string[] = []) => {
    render(<KeyboardShortcut kbdList={kbdList} />);

    const container = document.body;
    const keys = container.querySelectorAll('kbd');
    return { container, keys };
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('renders single key', () => {
      setup(['Ctrl']);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
    });

    it('renders multiple keys', () => {
      setup(['Ctrl', 'Shift', 'P']);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('renders each key inside <kbd> element', () => {
      const { keys } = setup(['Ctrl', 'K']);
      expect(keys).toHaveLength(2);
    });

    it('renders screen reader text', () => {
      setup(['Ctrl']);
      expect(screen.getByText('Keyboard shortcut:')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has sr-only class for assistive text', () => {
      const { container } = setup(['Ctrl']);
      const srOnly = container.querySelector('.sr-only');
      expect(srOnly).toBeInTheDocument();
      expect(srOnly).toHaveTextContent('Keyboard shortcut:');
    });

    it('assigns aria-label for each key', () => {
      setup(['Ctrl', 'Shift', 'K']);
      expect(screen.getByText('Ctrl')).toHaveAttribute('aria-label', 'Ctrl');
      expect(screen.getByText('Shift')).toHaveAttribute('aria-label', 'Shift');
      expect(screen.getByText('K')).toHaveAttribute('aria-label', 'K');
    });
  });

  describe('key combinations', () => {
    it('renders common shortcut Ctrl+C', () => {
      setup(['Ctrl', 'C']);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('renders three-key combination', () => {
      const { keys } = setup(['Ctrl', 'Shift', 'P']);
      expect(keys).toHaveLength(3);
    });

    it('renders special characters', () => {
      setup(['⌘', '⇧', 'K']);
      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('⇧')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('renders function keys', () => {
      setup(['F1']);
      expect(screen.getByText('F1')).toBeInTheDocument();
    });

    it('renders arrow keys', () => {
      setup(['↑', '↓', '←', '→']);
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('←')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders nothing for empty list', () => {
      const { keys } = setup([]);
      expect(keys).toHaveLength(0);
    });

    it('renders single-character keys', () => {
      setup(['A', 'B', 'C']);
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('renders long key names', () => {
      setup(['Control', 'Alternate', 'Delete']);
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Alternate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('renders numeric keys', () => {
      setup(['Ctrl', '1']);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders keys in correct order', () => {
      const { keys } = setup(['Ctrl', 'K']);
      expect(keys[0]).toHaveTextContent('Ctrl');
      expect(keys[1]).toHaveTextContent('K');
    });
  });

  describe('multiple instances', () => {
    it('renders multiple shortcuts independently', () => {
      const { container } = render(
        <>
          <KeyboardShortcut kbdList={['Ctrl', 'C']} />
          <KeyboardShortcut kbdList={['Ctrl', 'V']} />
        </>
      );
      const keys = container.querySelectorAll('kbd');
      expect(keys).toHaveLength(4);
    });

    it('renders separate sr-only text for each instance', () => {
      const { container } = render(
        <>
          <KeyboardShortcut kbdList={['Ctrl', 'C']} />
          <KeyboardShortcut kbdList={['Ctrl', 'V']} />
        </>
      );
      const srTexts = container.querySelectorAll('.sr-only');
      expect(srTexts).toHaveLength(2);
    });
  });
});
