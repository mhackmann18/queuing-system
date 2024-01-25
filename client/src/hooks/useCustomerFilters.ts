import { useMemo, useState } from 'react';
import { Department, StatusFilters } from 'utils/types';

const currentDepartment: Department = 'Motor Vehicle';

export interface CustomerFilters {
  date: Date;
  statuses: StatusFilters;
  department: Department;
}

export default function useCustomerFilters() {
  const [date, setDate] = useState(new Date());
  const [statuses, setStatuses] = useState<StatusFilters>({
    Serving: true,
    Waiting: true
  });
  const [department, setDepartment] = useState<Department>(currentDepartment);

  const filters = useMemo(
    (): CustomerFilters => ({ date, statuses, department }),
    [date, statuses, department]
  );

  return {
    filters,
    setDate,
    setStatuses,
    setDepartment
  };
}
