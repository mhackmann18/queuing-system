import { get12HourTimeString, formatTimePassed } from 'utils/helpers';
import { CustomerListRowProps } from './types';

export default function CustomerListRow({
  customer,
  selected = false,
  isPastDate,
  onClick,
  onMouseEnter,
  styles = ''
}: CustomerListRowProps) {
  const { status, name, checkInTime, callTimes } = customer;

  const containerStyles = {
    Waiting: `border-waiting`,
    Serving: 'bg-green-50 border-serving',
    Served: 'border-served',
    'No Show': 'border-no_show',
    MV1: 'border-mv1',
    MV2: 'border-mv2',
    MV3: 'border-mv3',
    MV4: 'border-mv4',
    DL1: 'border-dl1',
    DL2: 'border-dl2'
  };

  const statusTextStyles = {
    Waiting: 'text-waiting',
    Serving: 'text-serving font-semibold',
    Served: 'text-served',
    'No Show': 'text-no_show',
    MV1: 'text-mv1',
    MV2: 'text-mv2',
    MV3: 'text-mv3',
    MV4: 'text-mv4',
    DL1: 'text-dl1',
    DL2: 'text-dl2'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full justify-between p-3 text-left ${
        containerStyles[status]
      } ${selected ? 'bg-seasalt-500 border-l-4' : ''} ${styles}`}
      {...{ onMouseEnter }}
    >
      <div>
        {/* Status */}
        <span
          className={`inline-block w-20 font-medium ${statusTextStyles[status]}`}
        >
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
