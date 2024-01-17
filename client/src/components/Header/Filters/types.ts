import { Filter } from 'utils/types';

export interface FiltersProps {
  activeFilters: Record<Filter, boolean>;
  toggleFilter: (filter: Filter) => void;
}
