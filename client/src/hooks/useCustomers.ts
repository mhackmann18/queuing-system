import { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { statusFiltersToArr } from 'utils/helpers';
import { Customer, CustomerFilters } from 'utils/types';
import CustomerController from 'utils/CustomerController';
import { UserContext } from 'components/UserContextProvider/context';

export default function useCustomers(filters: CustomerFilters) {
  const user = useContext(UserContext);
  const controller = useMemo(
    () => new CustomerController(user.station),
    [user.station]
  );
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToArr(filters.statuses)];

    const { error, data } = await controller.get({
      date: filters.date,
      department: filters.department,
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
