import { Customer, CustomerAction } from 'components/types';
import { ReactElement } from 'react';
import { get12HourTimeString } from 'utils/helpers';

interface CustomerPanelProps {
  customer: Customer;
  customerActions: CustomerAction[];
}

export default function CustomerPanel({
  customer: { name, callTimes, checkInTime, reasonsForVisit, status },
  customerActions
}: CustomerPanelProps) {
  const getCustomerActionButtons = (): ReactElement[] =>
    customerActions.map(({ title, fn }) => (
      <button
        key={title}
        onClick={() => fn({ name })}
        className="border-slate_gray bg-french_gray_1-700 text-onyx mt-2 block rounded-lg border px-3 
        py-1 text-base font-semibold"
      >
        {title}
      </button>
    ));

  return (
    <div className="w-80 rounded-lg border px-8  py-4">
      <div className="flex justify-between">
        <h2 className="mb-4 text-2xl font-bold">{name}</h2>
        <span>{status}</span>
      </div>

      <h3 className="mt-2 font-semibold">Manage Customer</h3>
      <div>{getCustomerActionButtons()}</div>

      <h4 className="mt-6 font-semibold">Reasons for Visit</h4>
      <p className="text-french_gray_1-400">
        {reasonsForVisit ? reasonsForVisit?.join(', ') : '--'}
      </p>

      <h4 className="mt-2 font-semibold">Check In Time</h4>
      <p className="text-french_gray_1-400">
        {get12HourTimeString(checkInTime)}
      </p>

      <h4 className="mt-2 font-semibold">Times Called</h4>
      <p className="text-french_gray_1-400">
        {callTimes ? callTimes.map(get12HourTimeString).join(', ') : '--'}
      </p>
    </div>
  );
}
