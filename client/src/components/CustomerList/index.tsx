import CustomerRow from 'components/CustomerRow';
import { Customer } from 'components/types';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: number;
  setSelectedCustomerId: (newId: number) => void;
}

export default function CustomerList({
  customers,
  selectedCustomerId,
  setSelectedCustomerId
}: CustomerListProps) {
  const renderCustomerRow = (c: Customer) => {
    return (
      <li key={c.id} className="mb-1">
        <CustomerRow
          customer={c}
          onClick={(customer) => setSelectedCustomerId(customer.id)}
          selected={Boolean(c.id === selectedCustomerId)}
        />
      </li>
    );
  };

  return (
    <div className="flex grow flex-col">
      <div className="mb-1 flex justify-between pl-4 pr-5 text-sm font-semibold">
        <div>
          <span className="inline-block w-20">Status</span>
          <span className="inline-block w-52 pl-1">Customer Name</span>
        </div>
        <div>
          <span className="inline-block w-32">Check In Time</span>
          <span className="inline-block w-24">Time Called</span>
        </div>
      </div>
      <ul className="grow overflow-y-scroll border p-2">
        {customers.map(renderCustomerRow)}
      </ul>
    </div>
  );
}
