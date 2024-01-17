import CustomerRow from 'components/CustomerList/Row';
import { Customer } from 'utils/types';
import { CustomerListProps } from './types';

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomerId,
  selectedCustomerPositionControl
}: CustomerListProps) {
  const selectedCustomerId = selectedCustomer.id;

  const renderCustomerRow = (c: Customer) => {
    return (
      <>
        <li className="mb-1">
          <CustomerRow
            customer={c}
            onClick={() =>
              !selectedCustomerPositionControl
                ? setSelectedCustomerId(c.id)
                : selectedCustomerPositionControl?.setPositionAfterId(c.id)
            }
            selected={Boolean(c.id === selectedCustomerId)}
          />
        </li>
        {selectedCustomerPositionControl?.positionAfterId === c.id && (
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
    <div
      className={`flex grow flex-col bg-white ${
        selectedCustomerPositionControl && selectingCustomerContainerStyles
      }`}
    >
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
      <ul className={`grow overflow-y-scroll border p-2`}>
        {customers.map(renderCustomerRow)}
      </ul>
    </div>
  );
}

export const selectingCustomerContainerStyles = 'z-10 rounded-lg';
