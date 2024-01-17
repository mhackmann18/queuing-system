import { Customer } from 'utils/types';

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (id: number) => void;
  selectedCustomerPositionControl?: {
    positionAfterId: number | null;
    setPositionAfterId: (customerId: number) => void;
  };
}
