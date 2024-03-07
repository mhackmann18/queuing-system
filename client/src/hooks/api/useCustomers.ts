import { useState, useCallback, useEffect, useContext } from 'react';
import { sanitizeRawCustomer, sortCustomers } from 'utils/helpers';
import { Customer, CustomerFilters, CustomerDto, StatusFilter } from 'utils/types';
import Connector from 'utils/signalRConnection';
import useOffice from 'hooks/useOffice';
import { StatusFilters } from 'utils/types';
import { MAX_NUMBER_OF_DESKS } from 'utils/constants';
import useAuth from '../useAuth';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';
import api from 'utils/api';

export default function useCustomers(filters: CustomerFilters) {
  const { id: officeId } = useOffice();
  // If there's no desk context, desk num will be 0
  const { desk } = useContext(DeskContext);
  const deskNum = desk?.number || 0;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { events } = Connector();
  const { token } = useAuth();
  const [error, setError] = useState<string>('');

  const statusFiltersToStatusArray = useCallback(
    (statusFilters: StatusFilters) => {
      const statuses = [];
      for (const status in statusFilters) {
        if (statusFilters[status as StatusFilter]) {
          if (deskNum && status === 'Serving') {
            statuses.push(`Desk ${deskNum}`);
          } else if (deskNum && status === 'Other Desks') {
            for (let i = 1; i <= MAX_NUMBER_OF_DESKS; i++) {
              if (i !== deskNum) {
                statuses.push(`Desk ${i}`);
              }
            }
          } else {
            statuses.push(status);
          }
        }
      }
      return statuses;
    },
    [deskNum]
  );

  const fetchCustomers = useCallback(async () => {
    const statuses = [...statusFiltersToStatusArray(filters.statuses)];

    try {
      const response = await api.getCustomersWithFilters(
        officeId,
        {
          dates: [new Date().toISOString()],
          divisions: [{ name: filters.division, statuses }]
        },
        token
      );

      const customers = response.data;

      console.log(customers);

      setError('');
      setCustomers(
        sortCustomers(
          customers.map((c: CustomerDto) =>
            sanitizeRawCustomer(c, filters.division, deskNum)
          )
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }, [filters, officeId, statusFiltersToStatusArray, deskNum, token]);

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

  return { customers, error };
}
