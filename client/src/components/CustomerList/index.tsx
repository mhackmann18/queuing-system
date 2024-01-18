import CustomerRow from 'components/CustomerList/Row';
import { Customer } from 'utils/types';
import { CustomerListProps } from './types';
import { useEffect, useState } from 'react';

// TODO drag and drop position picker

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomerId,
  waitingListPositionControl
}: CustomerListProps) {
  const [orderedCustomers, setOrderedCustomers] =
    useState<Customer[]>(customers);

  // Position the selected customer at the proper WL index when the WL position picker is active
  useEffect(() => {
    if (waitingListPositionControl) {
      const { waitingListIndex } = waitingListPositionControl;
      const waitingList = [...customers];
      waitingList.splice(waitingListIndex, 0, selectedCustomer);
      setOrderedCustomers(waitingList);
    } else {
      setOrderedCustomers(customers);
    }
  }, [waitingListPositionControl, customers, selectedCustomer]);

  const mapCustomersToListItem = (c: Customer, index: number) => {
    let handleClick;
    let handleMouseEnter;
    let styles = '';

    // Determine what should happen when customer is clicked
    if (!waitingListPositionControl) {
      handleClick = () => setSelectedCustomerId(c.id);
    } else if (c.id === selectedCustomer.id) {
      // Lock in or repick the selected customer's postion in WL
      handleClick = () =>
        waitingListPositionControl.setPositionChosen(
          !waitingListPositionControl.positionChosen
        );
    }

    // Reposition the selected customer at the index of the customer being moused over
    if (
      waitingListPositionControl &&
      !waitingListPositionControl.positionChosen
    ) {
      handleMouseEnter = () =>
        waitingListPositionControl.setWaitingListIndex(index);
    }

    // Determine cursor style for customers when WL position picker is active
    if (waitingListPositionControl) {
      const { positionChosen } = waitingListPositionControl;

      if (c.id === selectedCustomer.id) {
        styles = positionChosen ? 'hover:cursor-grab' : 'hover:cursor-grabbing';
      } else {
        styles = 'hover:cursor-default hover:bg-white';
      }
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
        waitingListPositionControl && selectingWLPositionContainerStyles
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
