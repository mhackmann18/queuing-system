import { ReactElement } from 'react';
import { Customer } from 'utils/types';

export interface CustomerPanelWrapperProps {
  customer: Customer;
  children: ReactElement | null;
  containerStyles?: string;
}
