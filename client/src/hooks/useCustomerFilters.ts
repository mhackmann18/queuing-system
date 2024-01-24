import { useMemo, useState } from 'react';
import { Filter, Department } from 'utils/types';

const currentDepartment: Department = 'Motor Vehicle';

export default function useCustomerFilters() {
  const [date, setDate] = useState(new Date());
  const [statuses, setStatuses] = useState<Record<Filter, boolean>>({
    Waiting: true,
    'No Show': false,
    Served: false
  });
  const [department, setDepartment] = useState<Department>(currentDepartment);

  const filters = useMemo(
    () => ({ date, statuses, department }),
    [date, statuses, department]
  );

  return {
    filters,
    setDate,
    setStatuses,
    setDepartment
  };
}
