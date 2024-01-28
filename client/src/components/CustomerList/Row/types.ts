import { ReactEventHandler } from 'react';
import { Customer } from 'utils/types';

export interface CustomerListRowProps {
  customer: Customer;
  selected?: boolean;
  onClick?: ReactEventHandler;
  onMouseEnter?: ReactEventHandler;
  styles?: string;
  isPastDate: boolean;
}
