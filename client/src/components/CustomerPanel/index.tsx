import { Customer, CustomerAction, CustomerStatus } from 'components/types';
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
  const statusStyles: Record<CustomerStatus, string> = {
    Served: 'text-served border-served',
    'No Show': 'text-no_show border-no_show',
    Serving: 'text-serving border-serving',
    Waiting: 'text-waiting border-waiting',
    'At MV1': 'text-mv1',
    'At MV2': 'text-mv2',
    'At MV3': 'text-mv3',
    'At MV4': 'text-mv4',
    'At DL1': 'text-dl1',
    'At DL2': 'text-dl2'
  };

  const getCustomerActionButtons = (): ReactElement[] =>
    customerActions.map(({ title, fn }) => (
      <button
        key={title}
        onClick={() => fn({ name })}
        className=" bg-french_gray_1-700 text-onyx mt-2 block w-full rounded-md border 
        px-3 py-2 text-left text-sm font-semibold"
      >
        {title}
      </button>
    ));

  return (
    <div className="w-80 rounded-lg border px-8  py-4">
      <p className="text-french_gray_1-500">Selected</p>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{name}</h2>
        <span
          className={`rounded-md border-2 px-1 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      <h3 className="mt-2">Actions</h3>
      <div className="mb-4">{getCustomerActionButtons()}</div>

      <h4 className="text-french_gray_2-600 mt-2 text-sm font-medium">
        Check In Time
      </h4>
      <p className="text-lg">{get12HourTimeString(checkInTime)}</p>

      <h4 className="text-french_gray_2-600 mt-2 text-sm font-medium">
        Times Called
      </h4>
      <ul>
        {callTimes.length ? (
          callTimes.map((c) => (
            <li className="text-lg" key={c.toUTCString()}>
              {get12HourTimeString(c)}
            </li>
          ))
        ) : (
          <li className="text-french_gray_2-600 text-sm font-medium">--</li>
        )}
      </ul>

      <h4 className="text-french_gray_2-600 mt-2 text-sm font-medium">
        Reasons for Visit
      </h4>
      <p className="text-lg">
        {reasonsForVisit ? reasonsForVisit?.join(', ') : '--'}
      </p>
    </div>
  );
}
