import { useState, useCallback, useEffect } from 'react';
import {
  statusFiltersToArr,
  sanitizeRawCustomer,
  sortCustomers
} from 'utils/helpers';
import { Customer, CustomerFilters, CustomerDto } from 'utils/types';
import { DUMMY_OFFICE_ID } from 'utils/constants';
import Connector from 'utils/signalRConnection';

export default function useCustomers(filters: CustomerFilters) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { events } = Connector();

  console.log(customers);

  const fetchCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToArr(filters.statuses)];
    // TODO: Figure out whats going on here
    const utcDate = new Date(
      Date.UTC(
        filters.date.getFullYear(),
        filters.date.getMonth(),
        filters.date.getDate(),
        filters.date.getHours(),
        filters.date.getMinutes()
      )
    );

    const res = await fetch(
      `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}/customers/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dates: [utcDate],
          divisions: [{ name: filters.division, statuses }]
        })
      }
    );

    if (res.status === 200) {
      const { error, data } = await res.json();

      if (!error && data) {
        setCustomers(
          sortCustomers(
            data.map((c: CustomerDto) => sanitizeRawCustomer(c, filters.division))
          )
        );
      } else {
        // setError(res.error)
      }
    }
  }, [filters]);

  // Load new customers when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Load new customers on update event
  useEffect(() => {
    events({
      onCustomersUpdated: fetchCustomers
    });
  }, [events, filters.division, fetchCustomers]);

  return { customers, fetchCustomers };
}
