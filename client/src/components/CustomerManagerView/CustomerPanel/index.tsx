import { useState, useEffect } from 'react';
import { CustomerPanelProps, CustomerPanelState } from './types';
import CustomerPanelInfo from './Info';
import { CustomerPanelContext } from './context';
import StatusIndicator from './StatusIndicator';

export default function CustomerPanel({ customer, children }: CustomerPanelProps) {
  const [state, setState] = useState<CustomerPanelState>('default');
  const { status } = customer;

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
          <StatusIndicator status={status} />
        </div>

        {children}

        {state === 'default' && <CustomerPanelInfo customer={customer} />}
      </div>
    </CustomerPanelContext.Provider>
  );
}
