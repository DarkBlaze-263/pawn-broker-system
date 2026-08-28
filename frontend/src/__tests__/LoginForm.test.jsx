import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

// Mock the API service
jest.mock('../services/api', () => ({
  post: jest.fn()
}));

// Mock the AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn()
  })
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render login form correctly', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should have username and password fields', () => {
    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show validation error for empty username', async () => {
    renderWithRouter(<LoginForm />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  test('should show validation error for empty password', async () => {
    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('should enable submit button when form is valid', async () => {
    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });

  test('should disable submit button when form is invalid', () => {
    renderWithRouter(<LoginForm />);

    const loginButton = screen.getByRole('button', { name: /login/i });

    expect(loginButton).toBeDisabled();
  });

  test('should update username input value on change', () => {
    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    expect(usernameInput.value).toBe('testuser');
  });

  test('should update password input value on change', () => {
    renderWithRouter(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  test('should show loading state during login', async () => {
    const { post } = require('../services/api');
    post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  test('should handle successful login', async () => {
    const { post } = require('../services/api');
    const { useAuth } = require('../context/AuthContext');
    
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          token: 'test-token',
          user: { id: '123', username: 'testuser' }
        }
      }
    });

    const mockLogin = jest.fn();
    useAuth.mockReturnValue({ login: mockLogin });

    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  test('should handle login error', async () => {
    const { post } = require('../services/api');
    
    post.mockRejectedValue({
      response: {
        data: {
          success: false,
          message: 'Invalid credentials'
        }
      }
    });

    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('should handle network error', async () => {
    const { post } = require('../services/api');
    
    post.mockRejectedValue(new Error('Network Error'));

    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('should clear error message on input change', async () => {
    const { post } = require('../services/api');
    
    post.mockRejectedValue({
      response: {
        data: {
          success: false,
          message: 'Invalid credentials'
        }
      }
    });

    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  test('should handle Enter key to submit form', async () => {
    const { post } = require('../services/api');
    
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          token: 'test-token',
          user: { id: '123', username: 'testuser' }
        }
      }
    });

    renderWithRouter(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(post).toHaveBeenCalled();
    });
  });

  test('should show title and description', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByText(/pawn broker management system/i)).toBeInTheDocument();
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
  });
});
