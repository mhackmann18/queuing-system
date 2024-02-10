import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import DateToggler from 'components/CustomerManagerView/Header/DateToggler';
import CustomerList from 'components/CustomerManagerView/CustomerList';
import useCustomers from 'hooks/useCustomers';
import { Customer } from 'utils/types';
import Error from 'components/Error';

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
      <div className="border-b">
        <div className="relative mx-auto flex h-16 max-w-5xl justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <IoArrowBack />
            </Link>
            <h1 className="mr-4 inline-block w-80 items-center text-2xl font-bold">
              Service History
            </h1>
          </div>
          <div className="flex items-center">
            The current date and time goes here
          </div>
        </div>
      </div>
      <div className="border-b shadow-sm">
        <div className="mx-auto flex max-w-5xl justify-between py-3">
          <DateToggler
            date={forDate}
            setDate={(newDate: Date) => setForDate(newDate)}
            setError={setError}
          />
          <span>Avg. Wait Time: {Math.floor(averageWaitTime / 1000 / 60)} min</span>
        </div>
      </div>
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
