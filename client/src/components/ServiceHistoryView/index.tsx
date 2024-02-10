import { useEffect, useMemo, useState } from 'react';
import DateToggler from 'components/CustomerManagerView/Header/DateToggler';
import CustomerList from 'components/CustomerManagerView/CustomerList';
import useCustomers from 'hooks/useCustomers';
import { Customer } from 'utils/types';
import Error from 'components/Error';
import DashboardHeader from 'components/DashboardView/Header';

export default function ServiceHistoryView() {
  const [forDate, setForDate] = useState<Date>(new Date());
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
      <DashboardHeader
        bottomRowChild={
          <>
            <DateToggler
              date={forDate}
              setDate={(newDate: Date) => setForDate(newDate)}
              setError={setError}
            />
            <span className="font-medium">
              Average Wait Time{' '}
              <span className="text-outer_space-500 font-normal">
                {Math.floor(averageWaitTime / 1000 / 60)} min
              </span>
            </span>
          </>
        }
      />
      <div className="mx-auto mt-4 h-[calc(100%-8rem)] max-w-5xl">
        {selectedCustomer && (
          <CustomerList
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            isPastDate={true}
            wlPosPicker={null}
          />
        )}
      </div>
      {error && (
        <div className={`fixed bottom-10 right-10 z-20`}>
          <Error error={error} close={() => setError('')} />
        </div>
      )}
    </div>
  );
}
