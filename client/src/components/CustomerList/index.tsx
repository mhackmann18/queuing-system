import CustomerRow from 'components/CustomerRow';
import { Customer } from 'components/types';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomerId: (newId: number) => void;
  selectingCustomerPosition?: boolean;
  setCustomerPosition: (positionIndex: number) => void;
  customerPosition: number | null;
}

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomerId,
  selectingCustomerPosition = false,
  setCustomerPosition,
  customerPosition
}: CustomerListProps) {
  const selectedCustomerId = selectedCustomer.id;

  const renderCustomerRow = (c: Customer) => {
    return (
      <>
        <li className="mb-1">
          <CustomerRow
            customer={c}
            onClick={
              !selectingCustomerPosition
                ? (customer) => setSelectedCustomerId(customer.id)
                : () => setCustomerPosition(c.id)
            }
            selected={Boolean(c.id === selectedCustomerId)}
          />
        </li>
        {customerPosition === c.id && (
          <li className="mb-1">
            <CustomerRow
              customer={selectedCustomer}
              selected={Boolean(true)}
              onClick={() => undefined}
            />
          </li>
        )}
      </>
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
