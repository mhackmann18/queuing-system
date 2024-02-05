import { StatusIndicatorProps } from './types';
import { CustomerStatus } from 'utils/types';
import { DESK_REGEX } from 'utils/constants';

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const stylesByStatus: Record<CustomerStatus, string> = {
    Served: 'text-served border-served',
    'No Show': 'text-no_show border-no_show',
    Serving: 'text-serving border-serving',
    Waiting: 'text-waiting border-waiting'
  };

  const stylesByDeskNum = [
    '',
    'text-desk_1 border-desk_1',
    'text-desk_2 border-desk_2',
    'text-desk_3 border-desk_3',
    'text-desk_4 border-desk_4',
    'text-desk_5 border-desk_5',
    'text-desk_6 border-desk_6'
  ];

  const getStatusStyles = () => {
    if (DESK_REGEX.test(status)) {
      return stylesByDeskNum[Number(status[status.length - 1])];
    }

    return stylesByStatus[status];
  };

  return (
    <span
      className={`rounded-md border-2 px-1 py-0.5 text-xs font-semibold ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
}
