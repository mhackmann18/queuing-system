import { CustomerStatus } from 'utils/types';

export interface StatusFiltersProps {
  statusFilters: Record<CustomerStatus, boolean>;
  toggleFilter: (status: CustomerStatus) => void;
}
