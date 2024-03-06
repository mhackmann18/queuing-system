import { useState, useCallback, useEffect } from 'react';
import {
  convertLocalToUtc,
  sanitizeRawCustomer,
  sortCustomers
} from 'utils/helpers';
import { Customer, CustomerDto, DBCustomerStatus } from 'utils/types';
import Connector from 'utils/signalRConnection';
import useOffice from 'hooks/useOffice';
import useAuth from '../useAuth';
import api from 'utils/api';

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
  const { token } = useAuth();

  const fetchCustomers = useCallback(async () => {
    // TODO: Figure out whats going on here
    const utcDate = convertLocalToUtc(filters.date);

    try {
      const res = await api.getCustomersWithFilters(
        officeId,
        { dates: [utcDate], divisions: filters.divisions },
        token
      );

      const data = res.data;

      setCustomers(
        sortCustomers(
          data.map((c: CustomerDto) =>
            sanitizeRawCustomer(c, filters.divisions[0].name, 0)
          ) // TODO: Fix this atrocious code (filters.divisions[0].name)
        )
      );
    } catch (error) {
      setError(String(error));
    }
  }, [filters, officeId, token]);

  // Load new customers when filters change
  useEffect(() => {
    fetchCustomers();

    events({
      onCustomersUpdated: fetchCustomers
    });
  }, [fetchCustomers, events]);

  return { customers, error };
}
