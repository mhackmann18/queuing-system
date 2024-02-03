import { useState, useEffect } from 'react';
import { CustomerStatus } from 'utils/types';
import { CustomerPanelProps, CustomerPanelState } from './types';
import CustomerPanelInfo from './Info';
import { CustomerPanelContext } from './context';
import { DESK_REGEX } from 'utils/constants';

export default function CustomerPanel({ customer, children }: CustomerPanelProps) {
  const [state, setState] = useState<CustomerPanelState>('default');
  const { status } = customer;

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

  // Reset state when customer changes
  useEffect(() => {
    setState('default');
  }, [customer.id, setState]);

  return (
    <CustomerPanelContext.Provider value={{ state, setState }}>
      <div
        className={
          'border-french_gray_1 relative z-10 w-80 rounded-lg border bg-white px-8 py-4 shadow-md'
        }
      >
        <p className="text-french_gray_1-500">Selected</p>
        <div className="mb-4 flex items-start justify-between border-b pb-1.5">
          <h2 className="mb-1 max-w-36 text-xl font-bold">{customer.name}</h2>
          <span
            className={`rounded-md border-2 px-1 py-0.5 text-xs font-semibold ${getStatusStyles()}`}
          >
            {status}
          </span>
        </div>

        {children}

        {state === 'default' && <CustomerPanelInfo customer={customer} />}
      </div>
    </CustomerPanelContext.Provider>
  );
}
