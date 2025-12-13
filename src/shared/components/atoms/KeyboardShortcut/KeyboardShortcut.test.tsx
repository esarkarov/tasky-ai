import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { KeyboardShortcut } from './KeyboardShortcut';

describe('KeyboardShortcut', () => {
  const renderComponent = (kbdList: string[] = []) => {
    return render(<KeyboardShortcut kbdList={kbdList} />);
  };

  const getKeys = () => document.querySelectorAll('kbd');
  const getSrText = () => screen.queryByText('Keyboard shortcut:');

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('should render single key inside kbd element with screen reader text', () => {
      renderComponent(['Ctrl']);

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(getKeys()).toHaveLength(1);
      expect(getSrText()).toBeInTheDocument();
    });

    it('should render multiple keys with correct aria-labels', () => {
      renderComponent(['Ctrl', 'Shift', 'P']);

      expect(screen.getByText('Ctrl')).toHaveAttribute('aria-label', 'Ctrl');
      expect(screen.getByText('Shift')).toHaveAttribute('aria-label', 'Shift');
      expect(screen.getByText('P')).toHaveAttribute('aria-label', 'P');
      expect(getKeys()).toHaveLength(3);
    });

    it('should render keys in correct order', () => {
      renderComponent(['Ctrl', 'K']);

      const keys = getKeys();
      expect(keys[0]).toHaveTextContent('Ctrl');
      expect(keys[1]).toHaveTextContent('K');
    });
  });

  describe('accessibility', () => {
    it('should have sr-only class for assistive text', () => {
      renderComponent(['Ctrl']);

      const srOnly = document.querySelector('.sr-only');
      expect(srOnly).toBeInTheDocument();
      expect(srOnly).toHaveTextContent('Keyboard shortcut:');
    });
  });

  describe('key types', () => {
    it('should render special characters and symbols', () => {
      renderComponent(['⌘', '⇧', 'K']);

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('⇧')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should render arrow keys', () => {
      renderComponent(['↑', '↓', '←', '→']);

      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('←')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('should render function keys and numeric keys', () => {
      renderComponent(['F1']);
      expect(screen.getByText('F1')).toBeInTheDocument();

      renderComponent(['Ctrl', '1']);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render long key names', () => {
      renderComponent(['Control', 'Alternate', 'Delete']);

      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Alternate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should render nothing for empty list', () => {
      renderComponent([]);

      expect(getKeys()).toHaveLength(0);
    });

    it('should render multiple independent instances', () => {
      const { container } = render(
        <>
          <KeyboardShortcut kbdList={['Ctrl', 'C']} />
          <KeyboardShortcut kbdList={['Ctrl', 'V']} />
        </>
      );

      const keys = container.querySelectorAll('kbd');
      const srTexts = container.querySelectorAll('.sr-only');
      expect(keys).toHaveLength(4);
      expect(srTexts).toHaveLength(2);
    });
  });
});
