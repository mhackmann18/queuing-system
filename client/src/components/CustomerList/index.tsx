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
    return (
      <li className="mb-1" key={c.id}>
        <CustomerRow
          customer={c}
          onClick={() => {
            if (!waitingListPositionControl) {
              setSelectedCustomerId(c.id);
            } else if (c.id === selectedCustomer.id) {
              waitingListPositionControl.setPositionChosen(
                !waitingListPositionControl.positionChosen
              );
            }
          }}
          {...(waitingListPositionControl &&
          !waitingListPositionControl.positionChosen
            ? {
                onMouseEnter: () =>
                  waitingListPositionControl.setWaitingListIndex(index),
                styles: 'hover:cursor-grabbing'
              }
            : c.id === selectedCustomer.id && { styles: 'hover:cursor-grab' })}
          selected={c.id === selectedCustomer.id}
        />
      </li>
    );
  };

  return (
    <div
      className={`flex grow flex-col bg-white ${
        waitingListPositionControl && selectingCustomerContainerStyles
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

export const selectingCustomerContainerStyles =
  'z-10 rounded-lg outline outline-french_gray_1';
