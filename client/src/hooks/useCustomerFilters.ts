import { useMemo, useState, useContext } from 'react';
import { StatusFilters, CustomerFilters } from 'utils/types';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';

export default function useCustomerFilters() {
  const { desk } = useContext(DeskContext);
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
