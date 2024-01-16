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
  callTimes: [
    new Date('December 17, 1995 03:24:00'),
    new Date('December 17, 1995 03:28:00'),
    new Date('December 17, 1995 03:49:30')
  ]
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
  mockCustomer.callTimes.forEach((time) =>
    expect(
      screen.getByText(new RegExp(get12HourTimeString(time)))
    ).toBeInTheDocument()
  );
  mockCustomer.reasonsForVisit.forEach((r) => {
    expect(screen.getByText(new RegExp(r))).toBeInTheDocument();
  });
});

// ALL STATUSES

test.todo(
  "renders confirmation messages and buttons when 'Delete' button is clicked"
);

test.todo(
  "CustomerController.deleteOne runs when 'Delete' confirmation button is clicked"
);

// WAITING

test.todo("displays 'Delete' and 'Call Customer' buttons");

test.todo("makes api update request when 'Call to Station' button is clicked");

test.todo(
  "changes status to 'Serving' after 'Call to Station' is clicked and api request returns data"
);

test.todo("displays error when 'Call to Station' api request returns error");

describe("when status is 'Serving'", () => {
  it.todo(
    "displays 'Finish Serving', 'Mark No Show', 'Return to Waiting List', and 'Delete' buttons"
  );

  describe("when 'Finish Serving' button is clicked", () => {
    it.todo('makes api request');

    it.todo('when api returns error, should display error');

    it.todo("when api returns success, should change status to 'Served'");
  });

  describe("when 'Mark No Show' button is clicked", () => {
    it.todo('makes api request');

    it.todo('when api returns error, should display error');

    it.todo("when api returns success, should change status to 'No Show'");
  });

  describe("when 'Return to Waiting List' button is clicked", () => {
    it.todo('displays position picker');

    describe('when position picker is displayed', () => {
      describe('when clicking a position', () => {
        it('makes api request', () => {
          expect(screen.getByText('DFDSFSDF')).toBeInTheDocument();
        });

        it.todo('when api returns error, should display error');

        it.todo("when api returns success, should change status to 'Waiting'");
      });
    });
  });
});
