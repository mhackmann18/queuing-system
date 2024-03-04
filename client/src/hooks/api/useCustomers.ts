import { useState, useCallback, useEffect } from 'react';
import {
  convertLocalToUtc,
  sanitizeRawCustomer,
  sortCustomers
} from 'utils/helpers';
import { Customer, CustomerFilters, CustomerDto, StatusFilter } from 'utils/types';
import Connector from 'utils/signalRConnection';
import useDesk from 'hooks/useDesk';
import useOffice from 'hooks/useOffice';
import { StatusFilters } from 'utils/types';
import { MAX_NUMBER_OF_DESKS } from 'utils/constants';
import useAuth from '../useAuth';

export default function useCustomers(filters: CustomerFilters) {
  const { id: officeId } = useOffice();
  // If there's no desk context, desk num will be 0
  const { desk } = useDesk();
  const deskNum = desk?.number || 0;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { events } = Connector();
  const { token } = useAuth();

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

    const todaysDateUtc = convertLocalToUtc(new Date());

    const res = await fetch(
      `http://localhost:5274/api/v1/offices/${officeId}/customers/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dates: [todaysDateUtc],
          divisions: [
            {
              name: filters.division,
              statuses
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
            data.map((c: CustomerDto) =>
              sanitizeRawCustomer(c, filters.division, deskNum)
            )
          )
        );
      } else {
        // setError(res.error)
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

  return { customers };
}
