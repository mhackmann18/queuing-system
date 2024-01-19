import { CustomerStatus } from 'utils/types';
import { CustomerPanelWrapperProps } from './types';

export default function CustomerPanelWrapper({
  customer: { name, status },
  children,
  containerStyles = ''
}: CustomerPanelWrapperProps) {
  const statusStyles: Record<CustomerStatus, string> = {
    Served: 'text-served border-served',
    'No Show': 'text-no_show border-no_show',
    Serving: 'text-serving border-serving',
    Waiting: 'text-waiting border-waiting',
    MV1: 'text-mv1 border-mv1',
    MV2: 'text-mv2 border-mv2',
    MV3: 'text-mv3 border-mv3',
    MV4: 'text-mv4 border-mv4',
    DL1: 'text-dl1 border-mv5',
    DL2: 'text-dl2 border-mv6'
  };

  return (
    <div
      className={`border-french_gray_1 relative w-80 rounded-lg border bg-white px-8 py-4 shadow-md ${containerStyles}`}
    >
      <p className="text-french_gray_1-500">Selected</p>
      <div className="mb-4 flex items-start justify-between border-b pb-1.5">
        <h2 className="max-w-36 text-xl font-bold">{name}</h2>
        <span
          className={`mt-1 rounded-md border-2 px-1 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
      {children}
    </div>
  );
}
