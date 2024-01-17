import { WaitingListPositionControl } from 'utils/types';
import { Customer } from 'utils/types';

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (id: number) => void;
  // TODO EXPLAIN
  waitingListPositionControl?: WaitingListPositionControl;
}
