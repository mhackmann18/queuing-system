import CustomerRow from 'components/CustomerManagerView/CustomerList/Row';
import { Customer } from 'utils/types';
import { CustomerListProps } from './types';
import { useEffect, useState } from 'react';
import ColumnHeaders from './ColumnHeaders';

export default function CustomerList({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  wlPosPicker,
  isPastDate
}: CustomerListProps) {
  const [orderedCustomers, setOrderedCustomers] = useState<Customer[]>(customers);

  // Position the selected customer at the proper WL index when the WL position picker is active
  useEffect(() => {
    if (wlPosPicker) {
      const waitingList = customers.filter((c) => c.status === 'Waiting');
      waitingList.splice(wlPosPicker.index, 0, selectedCustomer);
      setOrderedCustomers(waitingList);
    } else {
      setOrderedCustomers(customers);
    }
  }, [wlPosPicker, customers, selectedCustomer]);

  const getCustomerRowClickHandler = (customer: Customer) => {
    if (wlPosPicker) {
      // Clicking selected customer controls whether their WL pos is locked
      return customer.id === selectedCustomer.id
        ? () => wlPosPicker.setLocked(!wlPosPicker.locked)
        : () => null;
    } else {
      return () => setSelectedCustomer(customer);
    }
  };

  const getCustomerRowStyles = (customer: Customer) => {
    // Default styles
    if (!wlPosPicker) {
      return 'group';
    }

    // No hover styles on WLPP customers that aren't selected
    if (customer.id !== selectedCustomer.id) {
      return 'hover:cursor-default no-underline';
    }

    // Selected customer styles for WLPP
    return wlPosPicker.locked
      ? 'hover:cursor-grab'
      : 'hover:cursor-grabbing shadow-md';
  };

  return (
    <div
      className={`flex grow flex-col bg-white ${
        wlPosPicker && 'border-french_gray_1 z-10 rounded-lg border'
      }`}
    >
      <ColumnHeaders isOldCustomers={isPastDate} />
      <ul className={`border-french_gray_1 grow overflow-y-scroll border`}>
        {orderedCustomers.map((customer, index) => (
          <li className="border-french_gray_1 border-b border-r" key={customer.id}>
            <CustomerRow
              customer={customer}
              selected={customer.id === selectedCustomer.id}
              onClick={getCustomerRowClickHandler(customer)}
              onMouseEnter={() =>
                wlPosPicker && !wlPosPicker.locked && wlPosPicker.setIndex(index)
              }
              styles={getCustomerRowStyles(customer)}
              isPastDate={isPastDate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
