import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import StationIcon from '.';
import { Station } from 'utils/types';

const mockOnClick = jest.fn();

test('displays station name', () => {
  const station = 'MV1';
  render(<StationIcon station={station} onClick={mockOnClick} />);

  expect(screen.getByText(station)).toBeInTheDocument();
});

test('calls onClick when clicked', async () => {
  const station = 'DL2';
  render(<StationIcon station={station} onClick={mockOnClick} />);

  userEvent.click(screen.getByRole('button', { name: station }));

  waitFor(() => expect(mockOnClick).toHaveBeenCalled());
});

describe.each([
  ['MV1' as Station],
  ['MV2' as Station],
  ['MV3' as Station],
  ['MV4' as Station],
  ['DL1' as Station],
  ['DL2' as Station]
])('applies corresponding style for', (station) => {
  test(`${station} station`, () => {
    render(<StationIcon station={station} onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveClass(
      `bg-${station.toLowerCase()}`
    );
  });
});
