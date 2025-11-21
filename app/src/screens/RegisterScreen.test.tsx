import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterScreen from './RegisterScreen';
import useRootStore from '../state/store';
import { Alert } from 'react-native';

// Mock Zustand store
vi.mock('../state/store');

describe('RegisterScreen', () => {
  const mockRegister = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mock
    vi.mocked(useRootStore).mockImplementation((selector: any) => {
      const state = {
        register: mockRegister,
        isLoading: false,
      };
      return selector(state);
    });
  });

  it('renders registration form with all elements', () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const createAccountTexts = screen.getAllByText('Create Account');
    expect(createAccountTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Join QuantumForge today')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('displays password requirements', () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByText('• Minimum 8 characters')).toBeInTheDocument();
    expect(screen.getByText('• At least 1 uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('• At least 1 number')).toBeInTheDocument();
  });

  it('updates all form inputs', () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const confirmInput = screen.getByLabelText('Confirm password') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('Password123');
    expect(confirmInput.value).toBe('Password123');
  });

  it('shows validation error for empty name', async () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Name is required');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        expect.stringContaining('email'),
      );
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error for weak password', async () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Validation Error', expect.any(String));
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error for mismatched passwords', async () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        expect.stringContaining('match'),
      );
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with valid inputs', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
    fireEvent.change(confirmInput, { target: { value: 'SecurePass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        'SecurePass123',
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Account created successfully!');
  });

  it('trims name and email whitespace', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });
    fireEvent.change(emailInput, { target: { value: '  john@example.com  ' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
    fireEvent.change(confirmInput, { target: { value: 'SecurePass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        'SecurePass123',
      );
    });
  });

  it('shows error alert on registration failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Email already registered'));
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
    fireEvent.change(confirmInput, { target: { value: 'SecurePass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Registration Failed',
        'Email already registered',
      );
    });
  });

  it('disables button while loading', () => {
    vi.mocked(useRootStore).mockImplementation((selector: any) => {
      const state = {
        register: mockRegister,
        isLoading: true,
      };
      return selector(state);
    });

    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const submitButton = screen.getByRole('button', { name: 'Create account' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
  });

  it('calls onSwitchToLogin when sign in link is clicked', () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const signInLink = screen.getByText('Sign In');
    fireEvent.click(signInLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<RegisterScreen onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    expect(nameInput).toHaveAttribute('aria-label', 'Full name');
    expect(emailInput).toHaveAttribute('aria-label', 'Email address');
    expect(passwordInput).toHaveAttribute('aria-label', 'Password');
    expect(confirmInput).toHaveAttribute('aria-label', 'Confirm password');
    expect(submitButton).toHaveAttribute('aria-label', 'Create account');
  });
});
