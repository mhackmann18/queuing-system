import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import UserSignInView from './index';

test('renders without crashing', () => {
  render(<UserSignInView />);
});
