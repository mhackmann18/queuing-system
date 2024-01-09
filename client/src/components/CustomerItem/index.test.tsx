import { render, screen, fireEvent } from '@testing-library/react';
import CustomerItem from '.';
import { Customer } from 'components/types';
import { get12HourTimeString } from 'utils/helpers';

// Mock the ReactEventHandler
const mockOnClick = jest.fn();

// Mock the customer data
const mockCustomer: Customer = {
  id: 1,
  status: 'Served',
  name: 'John Doe',
  checkInTime: new Date('2023-01-01T10:00:00Z'),
  callTime: new Date('2023-01-01T10:30:00Z')
};

test('renders CustomerItem component', () => {
  render(<CustomerItem customer={mockCustomer} onClick={mockOnClick} />);

  // Check if the rendered component matches the snapshot
  expect(screen.getByTestId('customer-item')).toMatchSnapshot();
});

test('handles click event', () => {
  render(<CustomerItem customer={mockCustomer} onClick={mockOnClick} />);

  // Simulate a click event
  fireEvent.click(screen.getByTestId('customer-item'));

  // Check if the onClick function was called
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});

test('displays customer information correctly', () => {
  render(<CustomerItem customer={mockCustomer} onClick={mockOnClick} />);

  // Check if the status, name, check-in time, and call time are rendered correctly
  expect(screen.getByText(mockCustomer.status)).toBeInTheDocument();
  expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
  expect(
    screen.getByText(get12HourTimeString(mockCustomer.checkInTime))
  ).toBeInTheDocument();
  expect(
    screen.getByText(get12HourTimeString(mockCustomer.callTime))
  ).toBeInTheDocument();
});

test('applies styles based on customer status', () => {
  render(<CustomerItem customer={mockCustomer} onClick={mockOnClick} />);

  // Check if the correct styles are applied based on the customer status
  expect(screen.getByTestId('customer-item')).toHaveClass(
    'border-slate_gray-700'
  );
  expect(screen.getByTestId('customer-item')).toHaveClass(
    'text-slate_gray-700'
  );
  // Add more assertions for other styles...
});
