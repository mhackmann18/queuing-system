/* eslint-disable tailwindcss/enforces-negative-arbitrary-values */
import { useEffect, useMemo, useState } from 'react';
import CustomerList from 'components/CustomerManagerView/CustomerList';
import useCustomers from 'hooks/useCustomers';
import { Customer } from 'utils/types';
import Error from 'components/Error';
import CustomerPanel from 'components/CustomerManagerView/CustomerPanel';
import FilterButton from 'components/CustomerManagerView/Header/StatusFiltersButtons/FilterButton';
import { getDateString } from 'utils/helpers';
import { FaRegCalendarAlt } from 'react-icons/fa';

const DUMMY_DIVISIONS = ['Motor Vehicle', 'Driver License'];

export default function ServiceHistoryView() {
  const [forDate] = useState<Date>(new Date());
  const filters = useMemo(
    () => ({
      statuses: { Served: true, 'No Show': true },
      date: forDate,
      division: 'Motor Vehicle'
    }),
    [forDate]
  );
  const { customers } = useCustomers(filters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string>('');

  const averageWaitTime = useMemo(() => {
    if (!customers) return 0;
    let timeSpentWaiting = 0;
    let numServed = 0;
    for (const customer of customers) {
      if (customer.status === 'Served') {
        timeSpentWaiting +=
          customer.timesCalled[0].getTime() - customer.checkInTime.getTime();
        console.log(timeSpentWaiting);
        numServed++;
      }
    }
    return timeSpentWaiting / numServed;
  }, [customers]);

  useEffect(() => {
    customers && setSelectedCustomer(customers[0]);
  }, [customers]);

  return (
    <div className="h-full">
      <div className="relative flex h-14 items-center justify-between">
        <div>
          <FilterButton
            onClick={() => null}
            text={
              <div className="flex items-center">
                <FaRegCalendarAlt size={14} className="mr-2" />
                {getDateString(forDate)}
              </div>
            }
          />
          {DUMMY_DIVISIONS.map((division) => (
            <FilterButton onClick={() => null} text={division} key={division} />
          ))}
        </div>
        <span className="font-medium">
          Average Wait Time:{' '}
          <span className="text-outer_space-500 font-normal">
            {Math.floor(averageWaitTime / 1000 / 60)} min
          </span>
        </span>
        <div className="border-platinum-700 absolute -left-[calc((100vw-64rem)/2)] bottom-0 w-screen border-b"></div>
      </div>
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
          {selectedCustomer && (
            <CustomerPanel
              customer={selectedCustomer}
              // actionEventHandlers={customerPanelActionEventHandlers!}
            />
          )}
        </div>
      </div>

      {error && (
        <div className={`fixed bottom-10 right-10 z-20`}>
          <Error error={error} close={() => setError('')} />
        </div>
      )}
    </div>
  );
}