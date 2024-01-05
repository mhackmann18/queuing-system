import { ReactEventHandler } from 'react';
import { get12HourTimeString } from 'utils/helpers';

type CustomerStatus = 'Waiting' | 'Serving' | 'Served' | 'No Show';

interface CustomerItemComponent {
  status: CustomerStatus;
  name: string;
  checkInTime: Date;
  callTime: Date;
  selected?: boolean;
  onClick: ReactEventHandler;
}

export default function CustomerItem({
  status,
  name,
  checkInTime,
  callTime,
  selected = false,
  onClick
}: CustomerItemComponent) {
  const containerStylesByStatus = {
    Waiting: 'border-slate_gray outline-slate_gray',
    Serving: 'border-green-500 outline-green-500',
    Served: 'border-french_gray_2 outline-french_gray_2',
    'No Show': 'border-french_gray_2 outline-french_gray_2'
  };

  const statusTextColors = {
    Waiting: 'text-slate_gray',
    Serving: 'text-green-500',
    Served: 'text-french_gray_2',
    'No Show': 'text-french_gray_2'
  };

  return (
    <div
      onClick={onClick}
      className={`hover:bg-seasalt flex justify-between rounded-lg border-2 p-2 hover:cursor-pointer ${
        containerStylesByStatus[status]
      } ${selected ? 'bg-seasalt outline' : 'bg-transparent'}`}
    >
      <div>
        <span
          className={`inline-block w-20 font-medium ${statusTextColors[status]}`}
        >
          {status}
        </span>
        <span>{name}</span>
      </div>
      <div>
        <span className="inline-block w-32">
          {get12HourTimeString(checkInTime)}
        </span>
        <span className="inline-block w-20">
          {get12HourTimeString(callTime)}
        </span>
      </div>
    </div>
  );
}
