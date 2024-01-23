import { Customer } from 'utils/types';

export interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (id: number) => void;
  WLPosPicker: WLPosPicker | null;
}

export interface WLPosPicker {
  index: number;
  setIndex: (index: number) => void;
  locked: boolean;
  setLocked: (chosen: boolean) => void;
}
