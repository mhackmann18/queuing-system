import { createContext } from 'react';
import { CustomerPanelState } from './types';

export const CustomerPanelContext = createContext<{
  state: CustomerPanelState;
  setState: (state: CustomerPanelState) => void;
}>({
  state: 'default',
  setState: () => null
});
