import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CheckInForm from '.';
import userEvent from '@testing-library/user-event';
import { FULL_NAME_MAX_LENGTH } from 'utils/constants';
import CustomerController from 'utils/CustomerController';

function setup() {
  const mockDivisions = [
    'Motor Vehicle',
    'License Offices Bureau',
    'Driver License'
  ];

  const mockOnSubmitSuccess = jest.fn();

  const utils = render(
    <CheckInForm divisions={mockDivisions} onSubmitSuccess={mockOnSubmitSuccess} />
  );

  return {
    ...utils,
    mockOnSubmitSuccess,
    mockDivisions,
    user: userEvent.setup()
  };
}

test('displays form properly', () => {
  const { mockDivisions } = setup();

  expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  expect(screen.getByText(/reason for visit/i)).toBeInTheDocument();
  for (const division of mockDivisions) {
    expect(screen.getByLabelText(division)).toBeInTheDocument();
  }
  expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument();
});

test('displays error message when full name is not entered', async () => {
  setup();

  screen.getByRole('button', { name: /check in/i }).click();

  expect(await screen.findByText(/this field is required/i)).toBeInTheDocument();
});

test('displays error message when full name is too long', async () => {
  const { mockDivisions, user } = setup();

  await user.type(
    screen.getByLabelText(/full name/i),
    'a'.repeat(FULL_NAME_MAX_LENGTH + 1)
  );
  await user.click(screen.getByLabelText(mockDivisions[0]));
  await user.click(screen.getByRole('button', { name: /check in/i }));

  expect(
    await screen.findByText(`Maximum length of ${FULL_NAME_MAX_LENGTH} characters`)
  ).toBeInTheDocument();
});

test('displays error message when reason for visit is not selected', async () => {
  const { user } = setup();

  await user.type(screen.getByLabelText(/full name/i), 'John Doe');
  await user.click(screen.getByRole('button', { name: /check in/i }));

  expect(await screen.findByText(/please select at least one/i)).toBeInTheDocument();
});

test('displays error message when server returns an error', async () => {
  jest
    .spyOn(CustomerController, 'create')
    .mockImplementation(async () => ({ error: 'server error', data: null }));
  const { mockDivisions, user } = setup();

  await user.type(screen.getByLabelText(/full name/i), 'John Doe');
  await user.click(screen.getByLabelText(mockDivisions[0]));
  await user.click(screen.getByRole('button', { name: /check in/i }));

  expect(await screen.findByText(/server error/i)).toBeInTheDocument();
});
