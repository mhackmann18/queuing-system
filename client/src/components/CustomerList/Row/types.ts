import { ReactEventHandler } from 'react';
import { Customer } from 'utils/types';

export interface CustomerListRowProps {
  customer: Customer;
  selected?: boolean;
  onClick: (customer: Customer) => void | ReactEventHandler;
}
