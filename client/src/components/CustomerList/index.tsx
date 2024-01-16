import CustomerRow from 'components/CustomerRow';
import { Customer } from 'components/types';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: number;
  setSelectedCustomerId: (newId: number) => void;
  selectingCustomerPosition?: boolean;
  setCustomerPosition: (positionIndex: number) => void;
}

export default function CustomerList({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  selectingCustomerPosition = false,
  setCustomerPosition
}: CustomerListProps) {
  const renderCustomerRow = (c: Customer) => {
    return (
      <li key={c.id} className="mb-1">
        <CustomerRow
          customer={c}
          onClick={
            !selectingCustomerPosition
              ? (customer) => setSelectedCustomerId(customer.id)
              : () => setCustomerPosition(1)
          }
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
      <ul
        className={`grow overflow-y-scroll border bg-white p-2 ${
          selectingCustomerPosition &&
          'outline-eerie_black z-10 outline outline-2'
        }`}
      >
        {customers.map(renderCustomerRow)}
      </ul>
    </div>
  );
}
