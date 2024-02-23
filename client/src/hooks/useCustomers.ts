import { useState, useCallback, useEffect } from 'react';
import { statusFiltersToArr } from 'utils/helpers';
import { Customer, CustomerFilters } from 'utils/types';
// import CustomerController from 'utils/CustomerController';
import { DUMMY_OFFICE_ID } from 'utils/constants';

export default function useCustomers(filters: CustomerFilters) {
  // const controller = useMemo(() => new CustomerController(), []);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToArr(filters.statuses)];

    console.log(
      JSON.stringify({
        dates: [filters.date],
        divisions: [{ name: filters.division, statuses }]
      })
    );

    const res = await fetch(
      `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}/customers/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dates: [filters.date],
          divisions: [{ name: filters.division, statuses }]
        })
      }
    );

    if (res.status === 200) {
      const { error, data } = await res.json();

      console.log(error, data);

      if (!error && data) {
        setCustomers(data);
      } else {
        // setError(res.error)
      }
    }
  }, [filters]);

  // Load new customers when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, fetchCustomers };
}
