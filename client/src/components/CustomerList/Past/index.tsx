import CustomerRow from 'components/CustomerList/Row';
import { Customer } from 'utils/types';
import { CustomerListProps } from './types';

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  WLPosPicker
}: CustomerListProps) {
  const mapCustomersToListItem = (c: Customer) => {
    return (
      <li className="mb-1" key={c.id}>
        <CustomerRow
          customer={c}
          selected={c.id === selectedCustomer.id}
          onClick={() => setSelectedCustomer(c)}
        />
      </li>
    );
  };

  return (
    <div
      className={`flex grow flex-col bg-white ${
        WLPosPicker && selectingWLPositionContainerStyles
      }`}
    >
      <div className="my-1 flex justify-between pl-4 pr-5 text-sm font-semibold">
        <div>
          <span className="inline-block w-20">Status</span>
          <span className="inline-block w-52 pl-1">Customer Name</span>
        </div>
        <div>
          <span className="inline-block w-24">Wait Time</span>
        </div>
      </div>
      <ul className={`grow overflow-y-scroll border p-2`}>
        {customers.map(mapCustomersToListItem)}
      </ul>
    </div>
  );
}

export const selectingWLPositionContainerStyles =
  'z-10 rounded-lg outline outline-french_gray_1';
