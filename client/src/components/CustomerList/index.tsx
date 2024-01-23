import CustomerRow from 'components/CustomerList/Row';
import { Customer } from 'utils/types';
import { CustomerListProps } from './types';
import { useEffect, useState } from 'react';

// TODO: Implement drag and drop position picker

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  WLPosPicker
}: CustomerListProps) {
  const [orderedCustomers, setOrderedCustomers] =
    useState<Customer[]>(customers);

  // Position the selected customer at the proper WL index when the WL position picker is active
  useEffect(() => {
    if (WLPosPicker) {
      const waitingList = [...customers];
      waitingList.splice(WLPosPicker.index, 0, selectedCustomer);
      setOrderedCustomers(waitingList);
    } else {
      setOrderedCustomers(customers);
    }
  }, [WLPosPicker, customers, selectedCustomer]);

  const mapCustomersToListItem = (c: Customer, index: number) => {
    let handleClick;
    let handleMouseEnter;
    let styles = '';

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
          : 'hover:cursor-grabbing';
      } else {
        styles = 'hover:cursor-default hover:bg-white';
      }
    } else {
      // WL position picker isn't active
      handleClick = () => setSelectedCustomer(c);
    }

    return (
      <li className="mb-1" key={c.id}>
        <CustomerRow
          customer={c}
          selected={c.id === selectedCustomer.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          styles={styles}
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
          <span className="inline-block w-32">Check In Time</span>
          <span className="inline-block w-24">Time Called</span>
        </div>
      </div>
      <ul className={`grow overflow-y-scroll border p-2`}>
        {orderedCustomers.map(mapCustomersToListItem)}
      </ul>
    </div>
  );
}

export const selectingWLPositionContainerStyles =
  'z-10 rounded-lg outline outline-french_gray_1';
