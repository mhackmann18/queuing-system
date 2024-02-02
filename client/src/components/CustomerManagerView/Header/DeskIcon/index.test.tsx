import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import DeskIcon from '.';
import { UserContext } from 'components/UserContextProvider/context';
import { User } from 'utils/types';
import { getDeskName } from 'utils/helpers';

function setup(mockUser: User = { id: 1, division: 'Motor Vehicle', deskNum: 1 }) {
  const mockOnClick = jest.fn();

  const utils = render(
    <UserContext.Provider value={{ ...mockUser }}>
      <DeskIcon focused={false} onClick={mockOnClick} />
    </UserContext.Provider>
  );

  return {
    ...utils,
    user: mockUser,
    onClick: mockOnClick
  };
}

const mockUsers: User[] = [
  { id: 1, division: 'Motor Vehicle', deskNum: 3 },
  { id: 2, division: 'Licensing', deskNum: 1 },
  { id: 3, division: 'License Offices Bureau', deskNum: 1 },
  { id: 4, division: 'Driver License Bureau', deskNum: 11 },
  { id: 5, division: 'Motor Vehicle', deskNum: 12 }
];

test.each(mockUsers)('displays station name properly', (mockUser) => {
  setup(mockUser);

  expect(
    screen.getByText(getDeskName(mockUser.division, mockUser.deskNum))
  ).toBeInTheDocument();
});

test('calls onClick when clicked', async () => {
  const { onClick, user } = setup();

  userEvent.click(
    screen.getByRole('button', { name: getDeskName(user.division, user.deskNum) })
  );

  waitFor(() => expect(onClick).toHaveBeenCalled());
});
