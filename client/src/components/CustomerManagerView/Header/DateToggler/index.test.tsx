import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { getDateString } from 'utils/helpers';
import DateToggler from '.';

const pastDate = new Date('01/21/2000');
const currentDate = new Date();

const mockSetDateFn = jest.fn();

test('displays date correctly', () => {
  render(<DateToggler date={pastDate} setDate={mockSetDateFn} />);

  expect(screen.getByText(getDateString(pastDate))).toBeInTheDocument();
});

test("disables Next Date button and applies style when date is equal to today's date", () => {
  render(<DateToggler date={currentDate} setDate={mockSetDateFn} />);

  expect(screen.getByRole('button', { name: 'Next Date' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Next Date' })).toHaveClass(
    'text-french_gray_1'
  );
});

test("displays date as 'Today' when date is equal to today's date", () => {
  render(<DateToggler date={currentDate} setDate={mockSetDateFn} />);

  expect(screen.getByText('Today')).toBeInTheDocument();
});

test('calls setDate with day - 1 when Previous Date button is clicked', async () => {
  const date = new Date();
  render(<DateToggler date={date} setDate={mockSetDateFn} />);

  userEvent.click(screen.getByRole('button', { name: 'Previous Date' }));

  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  waitFor(() => expect(date.getDay()).toEqual(oneDayAgo.getDay()));
  waitFor(() => expect(mockSetDateFn).toHaveBeenCalledTimes(1));
});

test('calls setDate with day + 1 when Next Date button is clicked', () => {
  const date = new Date();
  render(<DateToggler date={date} setDate={mockSetDateFn} />);

  userEvent.click(screen.getByRole('button', { name: 'Next Date' }));

  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  waitFor(() => expect(date.getDay()).toEqual(tomorrow.getDay()));
  waitFor(() => expect(mockSetDateFn).toHaveBeenCalledTimes(1));
});
