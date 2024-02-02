import { get12HourTimeString, formatTimePassed } from 'utils/helpers';
import { CustomerListRowProps } from './types';
import { CustomerStatus } from 'utils/types';

export default function CustomerListRow({
  customer,
  selected = false,
  isPastDate,
  onClick,
  onMouseEnter,
  styles = ''
}: CustomerListRowProps) {
  const { status, name, checkInTime, callTimes } = customer;

  const containerStyles: Record<CustomerStatus, string> = {
    Waiting: `border-waiting`,
    Serving: 'bg-green-50 border-serving',
    Served: 'border-served',
    'No Show': 'border-no_show',
    'Desk 1': 'border-desk_1',
    'Desk 2': 'border-desk_2',
    'Desk 3': 'border-desk_3',
    'Desk 4': 'border-desk_4',
    'Desk 5': 'border-desk_5',
    'Desk 6': 'border-desk_6'
  };

  const statusTextStyles: Record<CustomerStatus, string> = {
    Waiting: 'text-waiting',
    Serving: 'text-serving font-semibold',
    Served: 'text-served',
    'No Show': 'text-no_show',
    'Desk 1': 'text-desk_1',
    'Desk 2': 'text-desk_2',
    'Desk 3': 'text-desk_3',
    'Desk 4': 'text-desk_4',
    'Desk 5': 'text-desk_5',
    'Desk 6': 'text-desk_6'
  };

  const getContainerStyles = () => {
    if (
      /^Desk \d+$/.test(customer.status) &&
      Number(customer.status[customer.status.length - 1]) > 6
    ) {
      return containerStyles['Desk 6'];
    }

    return containerStyles[customer.status];
  };

  const getStatusTextStyles = () => {
    if (
      /^Desk \d+$/.test(customer.status) &&
      Number(customer.status[customer.status.length - 1]) > 6
    ) {
      return statusTextStyles['Desk 6'];
    }

    return statusTextStyles[customer.status];
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full justify-between p-3 text-left ${getContainerStyles()} ${
        selected ? 'bg-seasalt-500 border-l-4' : ''
      } ${styles}`}
      {...{ onMouseEnter }}
    >
      <div>
        {/* Status */}
        <span className={`inline-block w-20 font-medium ${getStatusTextStyles()}`}>
          {status}
        </span>
        {/* Customer Name */}
        <span className="inline-block w-72 underline-offset-2 group-hover:underline">
          {name}
        </span>
      </div>
      {isPastDate ? (
        <div>
          <span className="inline-block w-24">
            {formatTimePassed(checkInTime, callTimes[callTimes.length - 1])}
            {/* {callTimes.length ? get12HourTimeString(callTimes[0]) : ''} */}
          </span>
        </div>
      ) : (
        <div>
          {/* Check In Time */}
          <span className="inline-block w-32">
            {get12HourTimeString(checkInTime)}
          </span>
          {/* Time Called */}
          <span className="inline-block w-20">
            {callTimes.length ? get12HourTimeString(callTimes[0]) : ''}
          </span>
        </div>
      )}
    </button>
  );
}
