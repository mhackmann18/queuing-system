import CustomerRow from 'components/CustomerList/Row';
import { Customer } from 'utils/types';
import { CustomerListProps } from './types';
import { useEffect, useState } from 'react';

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  WLPosPicker,
  isPastDate
}: CustomerListProps) {
  const [orderedCustomers, setOrderedCustomers] = useState<Customer[]>(customers);

  // Position the selected customer at the proper WL index when the WL position picker is active
  useEffect(() => {
    if (WLPosPicker) {
      const waitingList = customers.filter((c) => c.status === 'Waiting');
      waitingList.splice(WLPosPicker.index, 0, selectedCustomer);
      setOrderedCustomers(waitingList);
    } else {
      setOrderedCustomers(customers);
    }
  }, [WLPosPicker, customers, selectedCustomer]);

  const mapCustomersToListItem = (c: Customer, index: number) => {
    let handleClick;
    let handleMouseEnter;
    let styles = 'group';

    // If WL position picker is active, applies appropriate behaviors to the CustomerRow buttons
    if (WLPosPicker) {
      // Clicking selected customer controls whether their WL pos is locked
      if (c.id === selectedCustomer.id) {
        handleClick = () => WLPosPicker.setLocked(!WLPosPicker.locked);
      }

      // If WL pos isn't locked, reposition selected customer at index of moused over customer
      if (!WLPosPicker.locked) {
        handleMouseEnter = () => WLPosPicker.setIndex(index);
      }

      // Determine hover cursor style
      if (c.id === selectedCustomer.id) {
        styles = WLPosPicker.locked
          ? 'hover:cursor-grab'
          : 'hover:cursor-grabbing shadow-md';
      } else {
        styles = 'hover:cursor-default no-underline';
      }
    } else {
      // Default behavior
      handleClick = () => setSelectedCustomer(c);
    }

    return (
      <li className="border-french_gray_1 border-b border-r" key={c.id}>
        <CustomerRow
          customer={c}
          selected={c.id === selectedCustomer.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          styles={styles}
          isPastDate={isPastDate}
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
          <span className="inline-block w-52">Customer Name</span>
        </div>
        {isPastDate ? (
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
      <ul className={`border-french_gray_1 grow overflow-y-scroll border`}>
        {orderedCustomers.map(mapCustomersToListItem)}
      </ul>
    </div>
  );
}

export const selectingWLPositionContainerStyles =
  'z-10 rounded-lg border border-french_gray_1';
