import useCustomers from 'hooks/useCustomers';
import { useMemo } from 'react';
import { WaitingListProps } from './types';

export default function WaitingList({ division }: WaitingListProps) {
  const filters = useMemo(
    () => ({
      date: new Date(),
      statuses: { Waiting: true },
      division
    }),
    [division]
  );

  const { customers } = useCustomers(filters);

  return (
    <div key={division} className="flex-1 border-r-4 last:border-r-0">
      {/* Division Heading */}
      <h2
        className="flex h-28 items-center justify-center border-b text-4xl font-bold 
  shadow-md 2xl:h-32 2xl:text-5xl"
      >
        {division}
      </h2>
      <div className="waiting-list-blur flex h-[calc(100vh-7rem)] justify-center overflow-hidden pt-12 2xl:h-[calc(100vh-8rem)]">
        <div className="w-4/5">
          {/* Waiting List Heading */}
          <h3 className="text-onyx mb-5 text-3xl font-bold 2xl:text-4xl">
            Waiting List
          </h3>
          {/* Waiting List */}
          <ul className="text-3xl 2xl:text-4xl">
            {customers.map((customer) => (
              <li
                className="mb-2 flex items-center overflow-hidden rounded-lg border-4 p-4 2xl:p-6"
                key={customer.id}
              >
                {customer.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
