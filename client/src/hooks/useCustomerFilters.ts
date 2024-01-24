import { useMemo, useState } from 'react';
import { CustomerStatus, Department } from 'utils/types';

const currentDepartment: Department = 'Motor Vehicle';

export interface CustomerFilters {
  date: Date;
  statuses: Record<CustomerStatus, boolean>;
  department: Department;
}

export default function useCustomerFilters() {
  const [date, setDate] = useState(new Date());
  const [statuses, setStatuses] = useState<Record<CustomerStatus, boolean>>({
    Waiting: true,
    'No Show': false,
    Served: false,
    Serving: true,
    MV1: false,
    MV2: false,
    MV3: false,
    MV4: false,
    DL1: false,
    DL2: false
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
