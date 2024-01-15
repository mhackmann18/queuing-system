import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { get12HourTimeString } from 'utils/helpers';
import CustomerPanel from '.';
import { Customer, CustomerAction } from 'components/types';

const mockCustomer: Customer = {
  id: 1,
  name: 'John Doe',
  status: 'Serving',
  reasonsForVisit: ['Motor Vehicle', "Driver's License"],
  checkInTime: new Date(),
  callTimes: [new Date(), new Date(), new Date()]
};

const mockCustomerActions: CustomerAction[] = [
  {
    title: 'Finish Serving',
    fn: () => null
  }
];

test('displays customer information', () => {
  render(
    <CustomerPanel
      customer={mockCustomer}
      customerActions={mockCustomerActions}
    />
  );

  expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
  expect(
    screen.getByText(get12HourTimeString(mockCustomer.checkInTime))
  ).toBeInTheDocument();
  expect(
    screen.getByText(get12HourTimeString(mockCustomer.callTimes[0]))
  ).toBeInTheDocument();
  expect(
    screen.getByText(mockCustomer.reasonsForVisit![0])
  ).toBeInTheDocument();
  expect(
    screen.getByText(mockCustomer.reasonsForVisit![1])
  ).toBeInTheDocument();
});

// ALL STATUSES

test(
  "renders confirmation messages and buttons when 'Delete' button is clicked"
);

test(
  "CustomerController.deleteOne runs when 'Delete' confirmation button is clicked"
);

// WAITING

test("displays 'Delete' and 'Call Customer' buttons");

test("makes api update request when 'Call to Station' button is clicked");

test(
  "changes status to 'Serving' after 'Call to Station' is clicked and api request returns data"
);

test("shows error when 'Call to Station' api request returns error");

// Serving

test(
  "displays 'Finish Serving', 'Mark No Show', 'Return to Waiting List', and 'Delete' buttons"
);

test('');
