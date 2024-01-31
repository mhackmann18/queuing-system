import { Customer } from 'utils/types';
import { ReactNode } from 'react';

export interface CustomerPanelProps {
  customer: Customer;
  children: ReactNode;
}
