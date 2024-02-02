import { useState, useCallback, useEffect, useMemo } from 'react';
import { statusFiltersToArr } from 'utils/helpers';
import { Customer, CustomerFilters } from 'utils/types';
import CustomerController from 'utils/CustomerController';

export default function useCustomers(filters: CustomerFilters) {
  const controller = useMemo(() => new CustomerController(), []);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToArr(filters.statuses)];

    const { error, data } = await controller.get({
      date: filters.date,
      division: filters.division,
      statuses
    });

    if (!error && data) {
      setCustomers(data);
    } else {
      // setError(res.error)
    }
  }, [filters, controller]);

  // Load new customers when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, fetchCustomers, controller };
}
