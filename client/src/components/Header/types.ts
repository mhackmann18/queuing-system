import { Station, Department, CustomerStatus } from 'utils/types';

interface Filters {
  date: Date;
  department: Department;
  statuses: Record<CustomerStatus, boolean>;
}

export interface ManageCustomersHeaderProps {
  signedInStation: Station | 'none';
  filters: Filters;
  filterSetters: {
    setDate: (date: Date) => void;
    setDepartment: (department: Department) => void;
    setStatuses: (statusFilters: Record<CustomerStatus, boolean>) => void;
  };
}
