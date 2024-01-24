import { useState, useCallback, useEffect } from 'react';
import { statusFiltersToArr } from 'utils/helpers';
import { Customer } from 'utils/types';
import { CustomerFilters } from './useCustomerFilters';
import CustomerController from 'utils/CustomerController';

export default function useCustomers(
  filters: CustomerFilters,
  apiController: CustomerController
) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadUpdatedCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToArr(filters.statuses)];

    const { error, data } = await apiController.get({
      date: filters.date,
      department: filters.department,
      statuses
    });
    if (!error && data) {
      setCustomers(data);
    } else {
      // setError(res.error)
    }
  }, [filters, apiController]);

  // Load new customers when filters change
  useEffect(() => {
    loadUpdatedCustomers();
  }, [loadUpdatedCustomers]);

  return { customers, loadUpdatedCustomers };
}
