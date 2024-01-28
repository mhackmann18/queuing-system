import { Customer } from 'utils/types';

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomer: (customer: Customer) => void;
  WLPosPicker: WLPosPicker | null;
  isPastDate: boolean;
}

export interface WLPosPicker {
  index: number;
  setIndex: (index: number) => void;
  locked: boolean;
  setLocked: (chosen: boolean) => void;
}
