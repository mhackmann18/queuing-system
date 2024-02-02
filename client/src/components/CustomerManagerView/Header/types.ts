import { Division, StatusFilters } from 'utils/types';

interface Filters {
  date: Date;
  division: Division;
  statuses: StatusFilters;
}

export interface ManageCustomersHeaderProps {
  filters: Filters;
  filterSetters: {
    setDate: (date: Date) => void;
    setDivision: (division: Division) => void;
    setStatuses: (statusFilters: StatusFilters) => void;
  };
  setError: (error: string) => void;
}
