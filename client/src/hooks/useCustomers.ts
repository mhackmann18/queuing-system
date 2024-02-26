import { useState, useCallback, useEffect } from 'react';
import {
  statusFiltersToArr,
  sanitizeRawCustomer,
  sortCustomers
} from 'utils/helpers';
import { Customer, CustomerFilters, CustomerDto } from 'utils/types';
import Connector from 'utils/signalRConnection';
import useDesk from 'hooks/useDesk';
import useOffice from 'hooks/useOffice';

export default function useCustomers(filters: CustomerFilters) {
  const { id: officeId } = useOffice();
  const { deskNum } = useDesk();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { events } = Connector();

  const fetchCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToArr(filters.statuses)];
    console.log(statuses);
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
      `http://localhost:5274/api/v1/offices/${officeId}/customers/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dates: [utcDate],
          divisions: [
            {
              name: filters.division,
              statuses: statuses.map((s) =>
                s === 'Serving' ? `Desk ${deskNum}` : s
              )
            }
          ]
        })
      }
    );

    if (res.status === 200) {
      const { error, data } = await res.json();

      if (!error && data) {
        console.log(data);
        setCustomers(
          sortCustomers(
            data.map((c: CustomerDto) => sanitizeRawCustomer(c, filters.division))
          )
        );
      } else {
        // setError(res.error)
      }
    }
  }, [filters, deskNum, officeId]);

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

  return { customers };
}
