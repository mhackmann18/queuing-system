import { useState, useCallback, useEffect } from 'react';
import { sanitizeRawCustomer, sortCustomers } from 'utils/helpers';
import { Customer, CustomerDto, DBCustomerStatus } from 'utils/types';
import Connector from 'utils/signalRConnection';
import useOffice from 'hooks/useOffice';

interface Division {
  name: string;
  statuses: DBCustomerStatus[];
}

export interface CustomerFilters {
  date: Date;
  divisions: Division[];
}

// Unfortunatly this can only be used for service history view
export default function useCustomers(filters: CustomerFilters) {
  const { id: officeId } = useOffice();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { events } = Connector();
  const [error, setError] = useState<string>('');

  const fetchCustomers = useCallback(async () => {
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
          divisions: filters.divisions
        })
      }
    );

    const { error, data } = await res.json();

    if (!error && data) {
      setCustomers(
        sortCustomers(
          data.map((c: CustomerDto) =>
            sanitizeRawCustomer(c, filters.divisions[0].name)
          ) // TODO: Fix this atrocious code (filters.divisions[0].name)
        )
      );
    } else {
      setError(error);
    }
  }, [filters, officeId]);

  // Load new customers when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Load new customers on update event
  useEffect(() => {
    events({
      onCustomersUpdated: fetchCustomers
    });
  }, [events, fetchCustomers]);

  return { customers, error };
}
