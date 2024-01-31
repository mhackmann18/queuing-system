import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { get12HourTimeString } from 'utils/helpers';
import CustomerPanel from '.';
import { Customer } from 'utils/types';
import { ActionViewConfigProp } from './ActionView/types';
import { UserContext } from 'components/UserContextProvider/context';
import { User } from 'utils/types';
import userEvent from '@testing-library/user-event';

const mockUser: User = {
  id: 1,
  station: 'MV1'
};

const mockActionConfig: ActionViewConfigProp = {
  delete: {
    onCancel: () => null,
    onClick: () => null,
    onConfirm: () => null
  },
  returnToWaitingList: {
    onCancel: () => null,
    onClick: () => null,
    onConfirm: () => null,
    confirmBtnDisabled: false
  },
  markNoShow: {
    onCancel: () => null,
    onClick: () => null,
    onConfirm: () => null
  },
  callToStation: {
    onClick: () => null
  },
  finishServing: {
    onClick: () => null
  }
};

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

test('displays customer information', () => {
  render(
    <UserContext.Provider value={mockUser}>
      <CustomerPanel
        customer={mockCustomer}
        actionConfig={mockActionConfig}
        currentDept="Motor Vehicle"
      />
    </UserContext.Provider>
  );

  // Name
  expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
  // Status
  expect(screen.getByText(mockCustomer.status)).toBeInTheDocument();
  // Check in time
  expect(
    screen.getByText(new RegExp(get12HourTimeString(mockCustomer.checkInTime)))
  ).toBeInTheDocument();
  // Call times
  mockCustomer.callTimes.forEach((time) =>
    expect(
      screen.getByText(new RegExp(get12HourTimeString(time)))
    ).toBeInTheDocument()
  );
  // Reasons for visit
  mockCustomer.reasonsForVisit.forEach((r) => {
    expect(screen.getByText(new RegExp(r))).toBeInTheDocument();
  });
});

// WAITING

test.todo("displays 'Delete' and 'Call Customer' buttons");

describe("when 'Delete' button is clicked", () => {
  it('displays confirmation message and buttons', async () => {
    render(
      <UserContext.Provider value={mockUser}>
        <CustomerPanel
          customer={mockCustomer}
          actionConfig={mockActionConfig}
          currentDept="Motor Vehicle"
        />
      </UserContext.Provider>
    );

    userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(await screen.findByText(/confirm deletion/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
  });
});

describe("when 'Mark No Show' button is clicked", () => {
  mockCustomer.status = 'Waiting';

  it('displays confirmation message', async () => {
    render(
      <UserContext.Provider value={mockUser}>
        <CustomerPanel
          customer={mockCustomer}
          actionConfig={mockActionConfig}
          currentDept="Motor Vehicle"
        />
      </UserContext.Provider>
    );

    userEvent.click(screen.getByRole('button', { name: /mark no show/i }));

    expect(await screen.findByText(/mark customer as a no show\?/i)).toBeVisible();
  });

  it("displays confirmation message, when 'Cancel' button is clicked, hides confirmation message", async () => {
    render(
      <UserContext.Provider value={mockUser}>
        <CustomerPanel
          customer={mockCustomer}
          actionConfig={mockActionConfig}
          currentDept="Motor Vehicle"
        />
      </UserContext.Provider>
    );

    userEvent.click(screen.getByRole('button', { name: /mark no show/i }));

    expect(await screen.findByText(/mark customer as a no show\?/i)).toBeVisible();

    userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    waitFor(() =>
      expect(screen.queryByText(/mark customer as a no show\?/i)).toBeNull()
    );
  });

  it("displays confirmation message, when 'Mark No Show' confirmation button is clicked, hides confirmation message", async () => {
    render(
      <UserContext.Provider value={mockUser}>
        <CustomerPanel
          customer={mockCustomer}
          actionConfig={mockActionConfig}
          currentDept="Motor Vehicle"
        />
      </UserContext.Provider>
    );

    userEvent.click(screen.getByRole('button', { name: /mark no show/i }));

    expect(await screen.findByText(/mark customer as a no show\?/i)).toBeVisible();

    userEvent.click(screen.getByRole('button', { name: /mark no show/i }));

    waitFor(() =>
      expect(screen.queryByText(/mark customer as a no show\?/i)).toBeNull()
    );
  });
});

// Serving
describe("when customer status is 'Serving'", () => {
  mockCustomer.status = 'Serving';

  it("displays 'Finish Serving', 'Mark No Show', 'Return to Waiting List', and 'Delete' buttons", () => {
    render(
      <UserContext.Provider value={mockUser}>
        <CustomerPanel
          customer={mockCustomer}
          actionConfig={mockActionConfig}
          currentDept="Motor Vehicle"
        />
      </UserContext.Provider>
    );

    expect(
      screen.getByRole('button', { name: /finish serving/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /mark no show/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /return to waiting list/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  describe("when 'Return to Waiting List' button is clicked", () => {
    it.todo('displays position picker');

    describe('when position picker is displayed', () => {
      describe('when clicking a position', () => {
        it.todo('makes api request');

        it.todo('when api returns error, should display error');

        it.todo("when api returns success, should change status to 'Waiting'");
      });
    });
  });
});
