import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
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

test('renders customer data', () => {
  render(<CustomerItem customer={mockCustomer} onClick={mockOnClick} />);

  // Check if the rendered component matches the snapshot
  expect(screen.getByTestId('customer-item')).toMatchSnapshot();
});

test('onClick function prop is called on click', async () => {
  render(<CustomerItem customer={mockCustomer} onClick={mockOnClick} />);

  // Simulate a click event
  userEvent.click(screen.getByRole('button'));

  // Check if the onClick function was called
  waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
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
  const waitingCustomer: Customer = {
    status: 'Waiting',
    name: 'John Doe',
    callTime: new Date(),
    checkInTime: new Date(),
    id: 1
  };

  const { rerender } = render(
    <CustomerItem customer={waitingCustomer} onClick={mockOnClick} />
  );

  // Check if the correct styles are applied based on the customer status
  expect(screen.getByRole('button')).toHaveClass('border-waiting');
  expect(screen.getByText(waitingCustomer.status)).toHaveClass('text-waiting');

  waitingCustomer.status = 'Serving';
  rerender(<CustomerItem customer={waitingCustomer} onClick={mockOnClick} />);
  expect(screen.getByRole('button')).toHaveClass('border-serving');
  expect(screen.getByText(waitingCustomer.status)).toHaveClass('text-serving');

  waitingCustomer.status = 'Served';

  rerender(<CustomerItem customer={waitingCustomer} onClick={mockOnClick} />);
  expect(screen.getByRole('button')).toHaveClass('border-served');
  expect(screen.getByText(waitingCustomer.status)).toHaveClass('text-served');

  waitingCustomer.status = 'No Show';

  rerender(<CustomerItem customer={waitingCustomer} onClick={mockOnClick} />);
  expect(screen.getByRole('button')).toHaveClass('border-no_show');
  expect(screen.getByText(waitingCustomer.status)).toHaveClass('text-no_show');
});
