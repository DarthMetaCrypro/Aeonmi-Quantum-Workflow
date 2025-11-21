import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginScreen from './LoginScreen';
import useRootStore from '../state/store';
import { Alert } from 'react-native';

// Mock Zustand store
vi.mock('../state/store');

describe('LoginScreen', () => {
  const mockLogin = vi.fn();
  const mockOnSwitchToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mock
    vi.mocked(useRootStore).mockImplementation((selector: any) => {
      const state = {
        login: mockLogin,
        isLoading: false,
      };
      return selector(state);
    });
  });

  it('renders login form with all elements', () => {
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByText('QuantumForge')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it('updates email and password inputs', () => {
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        expect.stringContaining('email'),
      );
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for short password', async () => {
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Validation Error', expect.any(String));
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with valid credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'ValidPass123');
    });
  });

  it('trims email whitespace before submission', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'ValidPass123');
    });
  });

  it('shows error alert on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
    });
  });

  it('disables button while loading', () => {
    vi.mocked(useRootStore).mockImplementation((selector: any) => {
      const state = {
        login: mockLogin,
        isLoading: true,
      };
      return selector(state);
    });

    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('calls onSwitchToRegister when create account is clicked', () => {
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const createAccountButton = screen.getByRole('button', { name: 'Create account' });
    fireEvent.click(createAccountButton);

    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<LoginScreen onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    expect(emailInput).toHaveAttribute('aria-label', 'Email address');
    expect(passwordInput).toHaveAttribute('aria-label', 'Password');
    expect(submitButton).toHaveAttribute('aria-label', 'Sign in');
  });
});
