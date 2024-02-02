import { useMemo, useState } from 'react';
import { Division, StatusFilters, CustomerFilters } from 'utils/types';

const currentDivision: Division = 'Motor Vehicle';

export default function useCustomerFilters() {
  const [date, setDate] = useState(new Date());
  const [statuses, setStatuses] = useState<StatusFilters>({
    Serving: true,
    Waiting: true
  });
  const [division, setDivision] = useState<Division>(currentDivision);

  const filters = useMemo(
    (): CustomerFilters => ({ date, statuses, division }),
    [date, statuses, division]
  );

  console.log(statuses);

  return {
    filters,
    setDate,
    setStatuses,
    setDivision
  };
}
