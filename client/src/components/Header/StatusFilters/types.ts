import { Filter } from 'utils/types';

export interface StatusFiltersProps {
  statusFilters: Record<Filter, boolean>;
  toggleFilter: (filter: Filter) => void;
}
