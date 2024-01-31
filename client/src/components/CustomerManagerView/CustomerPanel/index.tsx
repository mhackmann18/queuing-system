import { CustomerStatus } from 'utils/types';
import { CustomerPanelProps } from './types';
import ActionView from './ActionView';

export default function CustomerPanel({
  customer,
  actionConfig,
  currentDept
}: CustomerPanelProps) {
  const statusStyles: Record<CustomerStatus, string> = {
    Served: 'text-served border-served',
    'No Show': 'text-no_show border-no_show',
    Serving: 'text-serving border-serving',
    Waiting: 'text-waiting border-waiting',
    MV1: 'text-mv1 border-mv1',
    MV2: 'text-mv2 border-mv2',
    MV3: 'text-mv3 border-mv3',
    MV4: 'text-mv4 border-mv4',
    DL1: 'text-dl1 border-dl1',
    DL2: 'text-dl2 border-dl2'
  };

  return (
    <div
      className={
        'border-french_gray_1 relative z-10 w-80 rounded-lg border bg-white px-8 py-4 shadow-md'
      }
    >
      <p className="text-french_gray_1-500">Selected</p>
      <div className="mb-4 flex items-start justify-between border-b pb-1.5">
        <h2 className="mb-1 max-w-36 text-xl font-bold">{customer.name}</h2>
        <span
          className={`rounded-md border-2 px-1 py-0.5 text-xs font-semibold ${
            statusStyles[customer.status]
          }`}
        >
          {customer.status}
        </span>
      </div>
      {actionConfig && (
        <ActionView
          customer={customer}
          actionConfig={actionConfig}
          currentDept={currentDept}
        />
      )}
    </div>
  );
}
