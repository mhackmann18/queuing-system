import { CustomerStatus } from 'utils/types';

export interface StatusFiltersProps {
  statusFilters: Record<CustomerStatus, boolean>;
  setStatusFilters: (statuses: Record<CustomerStatus, boolean>) => void;
}
