import { StatusFilters } from 'utils/types';

export interface StatusFiltersProps {
  statusFilters: StatusFilters;
  setStatusFilters: (statuses: StatusFilters) => void;
}
