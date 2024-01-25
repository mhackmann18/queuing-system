import { Station, Department, StatusFilters } from 'utils/types';

interface Filters {
  date: Date;
  department: Department;
  statuses: StatusFilters;
}

export interface ManageCustomersHeaderProps {
  signedInStation: Station | 'none';
  filters: Filters;
  filterSetters: {
    setDate: (date: Date) => void;
    setDepartment: (department: Department) => void;
    setStatuses: (statusFilters: StatusFilters) => void;
  };
}
