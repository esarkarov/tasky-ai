import { Error } from '@/features/analytics/components/atoms/Error/Error';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useNavigate, useRouteError } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
  useRouteError: vi.fn(),
}));

describe('Error', () => {
  const mockNavigate = vi.fn();
  const mockUseRouteError = vi.mocked(useRouteError);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  describe('error message display', () => {
    it('should display error message when error has message property', () => {
      const mockError: Error = {
        name: 'Error',
        message: 'Database connection failed',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    it('should display default message when error has no message', () => {
      mockUseRouteError.mockReturnValue({} as Error);

      render(<Error />);

      expect(screen.getByText('An unexpected error occurred while loading analytics data.')).toBeInTheDocument();
    });

    it('should display default message when error is null', () => {
      mockUseRouteError.mockReturnValue(null as unknown as Error);

      render(<Error />);

      expect(screen.getByText('An unexpected error occurred while loading analytics data.')).toBeInTheDocument();
    });

    it('should display default message when error is undefined', () => {
      mockUseRouteError.mockReturnValue(undefined as unknown as Error);

      render(<Error />);

      expect(screen.getByText('An unexpected error occurred while loading analytics data.')).toBeInTheDocument();
    });
  });

  describe('static content', () => {
    it('should display heading when rendered', () => {
      const mockError: Error = {
        name: 'Error',
        message: 'Test error',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      expect(screen.getByRole('heading', { name: 'Failed to Load Dashboard' })).toBeInTheDocument();
    });

    it('should display retry button when rendered', () => {
      const mockError: Error = {
        name: 'Error',
        message: 'Test error',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('should display go home button when rendered', () => {
      const mockError: Error = {
        name: 'Error',
        message: 'Test error',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      expect(screen.getByRole('button', { name: 'Go to Today' })).toBeInTheDocument();
    });
  });

  describe('retry button interaction', () => {
    it('should navigate to current route with replace when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockError: Error = {
        name: 'Error',
        message: 'Test error',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      await user.click(retryButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('.', { replace: true });
    });
  });

  describe('go home button interaction', () => {
    it('should navigate to today page when go home button is clicked', async () => {
      const user = userEvent.setup();
      const mockError: Error = {
        name: 'Error',
        message: 'Test error',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      const goHomeButton = screen.getByRole('button', { name: 'Go to Today' });
      await user.click(goHomeButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/app/today');
    });
  });

  describe('multiple interactions', () => {
    it('should handle multiple retry button clicks independently', async () => {
      const user = userEvent.setup();
      const mockError: Error = {
        name: 'Error',
        message: 'Test error',
      };
      mockUseRouteError.mockReturnValue(mockError);

      render(<Error />);

      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      await user.click(retryButton);
      await user.click(retryButton);

      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '.', { replace: true });
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '.', { replace: true });
    });
  });
});
