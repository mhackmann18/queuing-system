import { ReactEventHandler, ReactNode } from 'react';
import { get12HourTimeString } from 'utils/helpers';
import { Customer } from '../types';

interface CustomerItemComponent {
  customer: Customer;
  actionButtonsComponent?: ReactNode;
  selected?: boolean;
  onClick: ReactEventHandler;
}

export default function CustomerItem({
  customer: { status, name, checkInTime, callTime },
  actionButtonsComponent,
  selected = false,
  onClick
}: CustomerItemComponent) {
  const containerStyles = {
    Waiting: `border-slate_gray-600 outline-slate_gray-600`,
    Serving: 'border-green-500 outline-green-500',
    Served: 'border-french_gray_2 outline-french_gray_2',
    'No Show': 'border-french_gray_2 outline-french_gray_2',
    'At MV1': 'border-mv1 outline-mv1',
    'At MV2': 'border-mv2 outline-mv2',
    'At MV3': 'border-mv3 outline-mv3',
    'At MV4': 'border-mv4 outline-mv4',
    'At DL1': 'border-dl1 outline-dl1',
    'At DL2': 'border-dl2 outline-dl2'
  };

  const statusTextStyles = {
    Waiting: 'text-slate_gray-600',
    Serving: 'text-green-500',
    Served: 'text-french_gray_2',
    'No Show': 'text-french_gray_2',
    'At MV1': 'text-mv1',
    'At MV2': 'text-mv2',
    'At MV3': 'text-mv3',
    'At MV4': 'text-mv4',
    'At DL1': 'text-dl1',
    'At DL2': 'text-dl2'
  };

  return (
    <div
      onClick={onClick}
      className={`hover:bg-seasalt flex justify-between rounded-lg border-2 p-2 hover:cursor-pointer ${
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
        <span>{name}</span>
      </div>
      {/* Quick Actions */}
      {actionButtonsComponent}
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
    </div>
  );
}
