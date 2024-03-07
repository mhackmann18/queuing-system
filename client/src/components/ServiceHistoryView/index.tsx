/* eslint-disable tailwindcss/enforces-negative-arbitrary-values */
import { useEffect, useMemo, useState } from 'react';
import CustomerList from 'components/CustomerManagerView/CustomerList';
import useCustomers from 'hooks/api/useCustomersV2';
import { Customer, DBCustomerStatus } from 'utils/types';
import ErrorAlert from 'components/ErrorAlert';
import CustomerPanel from 'components/CustomerManagerView/CustomerPanel';
import useOffice from 'hooks/useOffice';
import DateToggler from 'components/CustomerManagerView/Header/DateToggler';
import { FaChevronDown } from 'react-icons/fa';

export default function ServiceHistoryView() {
  const { divisionNames } = useOffice();
  const [forDivisionIndex, setForDivisionIndex] = useState<number>(0);
  const [forDate, setForDate] = useState<Date>(new Date());
  const filters = useMemo(
    () => ({
      date: forDate,
      divisions: [
        {
          name: divisionNames[forDivisionIndex],
          statuses: ['Served', 'No Show'] as DBCustomerStatus[]
        }
      ]
    }),
    [forDate, forDivisionIndex, divisionNames]
  );
  const { customers, error: fetchCustomersError } = useCustomers(filters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (fetchCustomersError) {
      setError(fetchCustomersError);
    }
  }, [fetchCustomersError]);

  const averageWaitTime = useMemo(() => {
    if (!customers || !customers.length) {
      return 0;
    }

    let timeSpentWaiting = 0;
    let numServed = 0;

    for (const customer of customers) {
      if (customer.status === 'Served' || customer.status === 'No Show') {
        timeSpentWaiting +=
          customer.timesCalled[customer.timesCalled.length - 1].getTime() -
          customer.checkInTime.getTime();
        numServed++;
      }
    }
    return timeSpentWaiting / numServed;
  }, [customers]);

  useEffect(() => {
    customers && setSelectedCustomer(customers[0]);
  }, [customers]);

  useEffect(() => {
    if (fetchCustomersError) {
      setError(fetchCustomersError);
    }
  }, [fetchCustomersError]);

  // TODO: REMOVE THIS
  function handleToggleDivisionClick() {
    setForDivisionIndex((forDivisionIndex + 1) % divisionNames.length);
  }

  return (
    <div className="h-full">
      <div className="relative flex h-14 items-center">
        <DateToggler date={forDate} setDate={(date) => setForDate(date)} />

        <button
          onClick={handleToggleDivisionClick}
          type="button"
          className="hover:text-outer_space"
        >
          <span className="border-platinum-700 ml-4 flex items-center border-l pl-4 font-medium">
            <span className="mr-1">{divisionNames[forDivisionIndex]}</span>
            <FaChevronDown size={12} />
          </span>
        </button>

        <span className="ml-4 font-medium">
          Average Wait Time:{' '}
          <span className="text-outer_space-500 font-normal">
            {averageWaitTime
              ? `${Math.floor(averageWaitTime / 1000 / 60) || 1} min`
              : '--'}
          </span>
        </span>

        <div className="border-platinum-700 absolute -left-[calc((100vw-64rem)/2)] bottom-0 w-screen border-b"></div>
      </div>
      {customers.length ? (
        <div className="mx-auto flex h-[calc(100%-3.5rem)] max-w-5xl justify-between pt-4">
          {selectedCustomer && (
            <CustomerList
              customers={customers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              isPastDate={true}
              wlPosPicker={null}
            />
          )}
          <div className={`ml-4 h-full`}>
            {selectedCustomer && <CustomerPanel customer={selectedCustomer} />}
          </div>
        </div>
      ) : (
        <div className="text-french_gray_2 flex h-[calc(100%-3.5rem)] items-center justify-center">
          No customers found
        </div>
      )}

      {error && (
        <div className={`fixed bottom-10 right-10 z-20`}>
          <ErrorAlert error={error} close={() => setError('')} />
        </div>
      )}
    </div>
  );
}
