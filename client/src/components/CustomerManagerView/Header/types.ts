import { Department, StatusFilters } from 'utils/types';

interface Filters {
  date: Date;
  department: Department;
  statuses: StatusFilters;
}

export interface ManageCustomersHeaderProps {
  filters: Filters;
  filterSetters: {
    setDate: (date: Date) => void;
    setDepartment: (department: Department) => void;
    setStatuses: (statusFilters: StatusFilters) => void;
  };
  setError: (error: string) => void;
}
