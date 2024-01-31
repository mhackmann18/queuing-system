import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import CustomerRow from '.';
import { Customer, CustomerStatus } from 'utils/types';
import { get12HourTimeString } from 'utils/helpers';

// Mock ReactEventHandler
const mockOnClick = jest.fn();

// Mock the customer data
const mockCustomer: Customer = {
  id: 1,
  status: 'Served',
  name: 'John Doe',
  checkInTime: new Date('2023-01-01T10:00:00Z'),
  callTimes: [new Date('2023-01-01T10:30:00Z')],
  reasonsForVisit: ['Motor Vehicle']
};

test('calls onClick when clicked', async () => {
  render(<CustomerRow customer={mockCustomer} onClick={mockOnClick} />);

  userEvent.click(screen.getByRole('button'));

  waitFor(() => expect(mockOnClick).toHaveBeenCalledTimes(1));
});

test('displays customer information', () => {
  render(<CustomerRow customer={mockCustomer} onClick={mockOnClick} />);

  // Check if the status, name, check in time, and time called are rendered correctly
  expect(screen.getByText(mockCustomer.status)).toBeInTheDocument();
  expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
  expect(
    screen.getByText(get12HourTimeString(mockCustomer.checkInTime))
  ).toBeInTheDocument();
  expect(
    screen.getByText(get12HourTimeString(mockCustomer.callTimes[0]))
  ).toBeInTheDocument();
});

describe.each([
  ['Waiting' as CustomerStatus],
  ['Serving' as CustomerStatus],
  ['Served' as CustomerStatus],
  ['No Show' as CustomerStatus]
])('applies corresponding style for', (customerStatus) => {
  test(`${customerStatus} status`, () => {
    const customer: Customer = {
      status: customerStatus,
      name: 'John Doe',
      callTimes: [new Date()],
      checkInTime: new Date(),
      id: 1,
      reasonsForVisit: ['Motor Vehicle']
    };

    render(<CustomerRow customer={customer} onClick={mockOnClick} />);

    const colorName = customerStatus.toLowerCase().split(' ').join('_');

    expect(screen.getByRole('button')).toHaveClass(`border-${colorName}`);
    expect(screen.getByText(customer.status)).toHaveClass(`text-${colorName}`);
  });
});
