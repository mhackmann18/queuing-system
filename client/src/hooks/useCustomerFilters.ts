import { useMemo, useState } from 'react';
import { StatusFilters, CustomerFilters } from 'utils/types';
import useDesk from './useDesk';

export default function useCustomerFilters() {
  const { desk } = useDesk();
  const divisionName = desk!.divisionName;
  const [date, setDate] = useState(new Date());
  const [statuses, setStatuses] = useState<StatusFilters>({
    Serving: true,
    Waiting: true
  });
  const [division, setDivision] = useState<string>(divisionName);

  const filters = useMemo(
    (): CustomerFilters => ({ date, statuses, division }),
    [date, statuses, division]
  );

  return {
    filters,
    setDate,
    setStatuses,
    setDivision
  };
}
