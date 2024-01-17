import { Customer } from 'utils/types';

export interface WaitingListPositionControl {
  waitingListIndex: number;
  setWaitingListIndex: (index: number) => void;
  positionChosen: boolean;
  setPositionChosen: (chosen: boolean) => void;
}

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (id: number) => void;
  // TODO EXPLAIN
  waitingListPositionControl: WaitingListPositionControl | null;
}
