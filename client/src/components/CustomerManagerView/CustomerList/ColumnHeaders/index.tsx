import { CustomerListColumnHeadersProps } from './types';

export default function CustomerListColumnHeaders({
  isOldCustomers = true
}: CustomerListColumnHeadersProps) {
  return (
    <div className="my-1 flex justify-between pl-4 pr-5 text-sm font-semibold">
      <div>
        <span className="inline-block w-20">Status</span>
        <span className="inline-block w-52">Customer Name</span>
      </div>
      {isOldCustomers ? (
        <div>
          <span className="inline-block w-28 pl-2">Wait Time</span>
        </div>
      ) : (
        <div>
          <span className="inline-block w-32 pl-1">Check In Time</span>
          <span className="inline-block w-24 pl-1">Time Called</span>
        </div>
      )}
    </div>
  );
}
