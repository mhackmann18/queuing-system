import { Customer } from 'utils/types';

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (customerId: string) => void;
  wlPosPicker: WaitingListPositionPicker | null;
  isPastDate: boolean;
}

export interface WaitingListPositionPicker {
  index: number;
  setIndex: (index: number) => void;
  locked: boolean;
  setLocked: (chosen: boolean) => void;
}
