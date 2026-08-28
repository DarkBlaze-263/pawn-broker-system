import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillForm from '../components/Forms/BillForm';

// Mock the API service
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

// Mock the customer service
jest.mock('../services/customerService', () => ({
  searchCustomers: jest.fn()
}));

describe('BillForm Component', () => {
  const mockCustomer = {
    id: '123',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com'
  };

  const defaultProps = {
    customer: mockCustomer,
    onSubmit: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render bill form correctly', () => {
    render(<BillForm {...defaultProps} />);

    expect(screen.getByLabelText(/principal amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interest percentage/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create bill/i })).toBeInTheDocument();
  });

  test('should auto-calculate interest correctly', () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });

    // Interest = (10000 * 2) / 100 = 200
    // Total = 10000 + 200 = 10200
    expect(screen.getByText(/interest: ₹200/i)).toBeInTheDocument();
    expect(screen.getByText(/total: ₹10,200/i)).toBeInTheDocument();
  });

  test('should update calculations when principal changes', () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });

    fireEvent.change(principalInput, { target: { value: 20000 } });

    // Interest = (20000 * 2) / 100 = 400
    // Total = 20000 + 400 = 20400
    expect(screen.getByText(/interest: ₹400/i)).toBeInTheDocument();
    expect(screen.getByText(/total: ₹20,400/i)).toBeInTheDocument();
  });

  test('should show validation error for negative principal amount', async () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: -1000 } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/principal amount must be positive/i)).toBeInTheDocument();
    });
  });

  test('should show validation error for principal amount exceeding limit', async () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: 2000000 } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/principal amount cannot exceed/i)).toBeInTheDocument();
    });
  });

  test('should show validation error for interest rate out of range', async () => {
    render(<BillForm {...defaultProps} />);

    const interestInput = screen.getByLabelText(/interest percentage/i);
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(interestInput, { target: { value: 25 } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/interest percentage cannot exceed/i)).toBeInTheDocument();
    });
  });

  test('should add jewelry item when add button is clicked', () => {
    render(<BillForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });

    fireEvent.click(addButton);

    expect(screen.getByLabelText(/item description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/item type/i)).toBeInTheDocument();
  });

  test('should remove jewelry item when remove button is clicked', () => {
    render(<BillForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });

    fireEvent.click(addButton);

    // Fill in item details
    const descriptionInput = screen.getByLabelText(/item description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });

    const removeButton = screen.getByRole('button', { name: /remove item/i });
    fireEvent.click(removeButton);

    expect(screen.queryByLabelText(/item description/i)).not.toBeInTheDocument();
  });

  test('should validate item description is required', async () => {
    render(<BillForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });
    fireEvent.click(addButton);

    const submitButton = screen.getByRole('button', { name: /create bill/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/item description is required/i)).toBeInTheDocument();
    });
  });

  test('should validate item type is required', async () => {
    render(<BillForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/item description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });

    const submitButton = screen.getByRole('button', { name: /create bill/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/item type is required/i)).toBeInTheDocument();
    });
  });

  test('should validate market value is required', async () => {
    render(<BillForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/item description/i);
    const typeSelect = screen.getByLabelText(/item type/i);

    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });
    fireEvent.change(typeSelect, { target: { value: 'gold' } });

    const submitButton = screen.getByRole('button', { name: /create bill/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/market value is required/i)).toBeInTheDocument();
    });
  });

  test('should show error message when no items added', async () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least one item is required/i)).toBeInTheDocument();
    });
  });

  test('should call onSubmit with correct data when form is valid', async () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);
    const addButton = screen.getByRole('button', { name: /add item/i });
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/item description/i);
    const typeSelect = screen.getByLabelText(/item type/i);
    const marketValueInput = screen.getByLabelText(/market value/i);

    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });
    fireEvent.change(typeSelect, { target: { value: 'gold' } });
    fireEvent.change(marketValueInput, { target: { value: 15000 } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        principal_amount: 10000,
        interest_percentage: 2,
        items: [
          {
            item_description: 'Gold Ring',
            item_type: 'gold',
            current_market_value: 15000
          }
        ]
      });
    });
  });

  test('should call onCancel when cancel button is clicked', () => {
    render(<BillForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  test('should disable submit button during submission', async () => {
    const { post } = require('../services/api');
    post.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);
    const addButton = screen.getByRole('button', { name: /add item/i });
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/item description/i);
    const typeSelect = screen.getByLabelText(/item type/i);
    const marketValueInput = screen.getByLabelText(/market value/i);

    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });
    fireEvent.change(typeSelect, { target: { value: 'gold' } });
    fireEvent.change(marketValueInput, { target: { value: 15000 } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  test('should display customer information', () => {
    render(<BillForm {...defaultProps} />);

    expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.phone)).toBeInTheDocument();
  });

  test('should handle multiple items', () => {
    render(<BillForm {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const descriptionInputs = screen.getAllByLabelText(/item description/i);
    expect(descriptionInputs).toHaveLength(2);
  });

  test('should calculate total for multiple items', () => {
    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);
    const addButton = screen.getByRole('button', { name: /add item/i });

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });
    fireEvent.click(addButton);

    const marketValueInput = screen.getByLabelText(/market value/i);
    fireEvent.change(marketValueInput, { target: { value: 15000 } });

    // Total market value should be 15000
    expect(screen.getByText(/total market value: ₹15,000/i)).toBeInTheDocument();
  });

  test('should show error message on submission failure', async () => {
    const { post } = require('../services/api');
    
    post.mockRejectedValue({
      response: {
        data: {
          success: false,
          message: 'Failed to create bill'
        }
      }
    });

    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);
    const addButton = screen.getByRole('button', { name: /add item/i });
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/item description/i);
    const typeSelect = screen.getByLabelText(/item type/i);
    const marketValueInput = screen.getByLabelText(/market value/i);

    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });
    fireEvent.change(typeSelect, { target: { value: 'gold' } });
    fireEvent.change(marketValueInput, { target: { value: 15000 } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create bill/i)).toBeInTheDocument();
    });
  });

  test('should clear form after successful submission', async () => {
    const { post } = require('../services/api');
    
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          bill: { id: '123', bill_number: 'PB-2024-0001' }
        }
      }
    });

    render(<BillForm {...defaultProps} />);

    const principalInput = screen.getByLabelText(/principal amount/i);
    const interestInput = screen.getByLabelText(/interest percentage/i);
    const addButton = screen.getByRole('button', { name: /add item/i });
    const submitButton = screen.getByRole('button', { name: /create bill/i });

    fireEvent.change(principalInput, { target: { value: 10000 } });
    fireEvent.change(interestInput, { target: { value: 2 } });
    fireEvent.click(addButton);

    const descriptionInput = screen.getByLabelText(/item description/i);
    const typeSelect = screen.getByLabelText(/item type/i);
    const marketValueInput = screen.getByLabelText(/market value/i);

    fireEvent.change(descriptionInput, { target: { value: 'Gold Ring' } });
    fireEvent.change(typeSelect, { target: { value: 'gold' } });
    fireEvent.change(marketValueInput, { target: { value: 15000 } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(principalInput.value).toBe('');
      expect(interestInput.value).toBe('');
    });
  });
});
