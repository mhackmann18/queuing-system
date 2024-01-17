import { Customer } from 'utils/types';

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (newId: number) => void;
  selectingCustomerPosition?: boolean;
  setCustomerPosition: (positionIndex: number) => void;
  customerPosition: number | null;
}
