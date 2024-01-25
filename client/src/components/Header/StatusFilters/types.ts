import { CustomerFilters, StatusFilters } from 'utils/types';

export interface StatusFilterButtonsProps {
  filters: CustomerFilters;
  setStatuses: (statuses: StatusFilters) => void;
}
