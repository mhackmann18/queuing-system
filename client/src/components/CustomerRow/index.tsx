import { ReactEventHandler } from 'react';
import { get12HourTimeString } from 'utils/helpers';
import { Customer } from '../types';

interface CustomerRowComponent {
  customer: Customer;
  selected?: boolean;
  onClick: ReactEventHandler;
}

export default function CustomerRow({
  customer: { status, name, checkInTime, callTime },
  selected = false,
  onClick
}: CustomerRowComponent) {
  const containerStyles = {
    Waiting: `border-waiting outline-waiting`,
    Serving: 'border-serving outline-serving',
    Served: 'border-served outline-served',
    'No Show': 'border-no_show outline-no_show',
    'At MV1': 'border-mv1 outline-mv1',
    'At MV2': 'border-mv2 outline-mv2',
    'At MV3': 'border-mv3 outline-mv3',
    'At MV4': 'border-mv4 outline-mv4',
    'At DL1': 'border-dl1 outline-dl1',
    'At DL2': 'border-dl2 outline-dl2'
  };

  const statusTextStyles = {
    Waiting: 'text-waiting',
    Serving: 'text-serving',
    Served: 'text-served',
    'No Show': 'text-no_show',
    'At MV1': 'text-mv1',
    'At MV2': 'text-mv2',
    'At MV3': 'text-mv3',
    'At MV4': 'text-mv4',
    'At DL1': 'text-dl1',
    'At DL2': 'text-dl2'
  };

  return (
    <button
      onClick={onClick}
      className={`hover:bg-seasalt flex w-full justify-between rounded-lg border-2 p-2 text-left hover:cursor-pointer ${
        containerStyles[status]
      } ${selected ? 'bg-seasalt outline' : 'bg-transparent'}`}
    >
      <div>
        {/* Status */}
        <span
          className={`inline-block w-20 font-medium ${statusTextStyles[status]}`}
        >
          {status}
        </span>
        {/* Customer Name */}
        <span className="inline-block w-52">{name}</span>
      </div>
      <div>
        {/* Check In Time */}
        <span className="inline-block w-32">
          {get12HourTimeString(checkInTime)}
        </span>
        {/* Time Called */}
        <span className="inline-block w-20">
          {get12HourTimeString(callTime)}
        </span>
      </div>
    </button>
  );
}
