/* eslint-disable tailwindcss/enforces-negative-arbitrary-values */
import CustomerPanel from './CustomerPanel';
import { Customer } from 'utils/types';
import { useEffect, useState, useContext } from 'react';
import CustomerList from './CustomerList';
import useCustomerFilters from 'hooks/useCustomerFilters';
import useCustomers from 'hooks/api/useCustomers';
import Error from 'components/Error';
import { sameDay, getNextSelectedCustomer } from 'utils/helpers';
import { WaitingListPositionPickerState } from 'utils/types';
import { CustomerPanelActionEventHandlers } from './CustomerPanel/types';
import useNextCustomerId from 'hooks/useNextSelectedCustomer';
import useCustomerPanelActionEventHandlers from 'hooks/useCustomerPanelActionEventHandlers';
import StatusFiltersButtons from './Header/StatusFiltersButtons';
import { useBlocker } from 'react-router-dom';
import CustomerServiceWarningModal from './CustomerServiceWarningModal';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';
import useExtendDeskSession from 'hooks/useExtendDeskSession';

export default function CustomerManagerView() {
  // Application state and custom hooks
  const [wlPosPicker, setWlPosPicker] =
    useState<WaitingListPositionPickerState>(null);
  const [error, setError] = useState<string>('');
  const { filters, ...filterUtils } = useCustomerFilters();
  const { customers } = useCustomers(filters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const nextSelectedCustomerCandidateId = useNextCustomerId(
    selectedCustomer,
    customers
  );
  const { leaveDesk } = useContext(DeskContext);
  const customerPanelActionEventHandlers: CustomerPanelActionEventHandlers | null =
    useCustomerPanelActionEventHandlers(
      selectedCustomer,
      customers,
      wlPosPicker,
      setWlPosPicker,
      setError
    );
  useExtendDeskSession({
    onNearExpiration: () => setError('Session is about to expire')
  });

  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      if (selectedCustomer && selectedCustomer.status === 'Serving') {
        e.preventDefault();
        return (e.returnValue = '');
      } else {
        leaveDesk();
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [selectedCustomer, leaveDesk]); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Leave desk on unmount
  useEffect(() => {
    return () => {
      leaveDesk();
    };
  }, [leaveDesk]);

  // Block navigation when there's a customer being served
  const blocker = useBlocker(
    !!selectedCustomer && selectedCustomer.status === 'Serving'
  );

  // Ensure selected customer is always up to date.
  useEffect(() => {
    //  If there's no customers, there can be no selected customer.
    if (!customers?.length) {
      setSelectedCustomer(null);
      return;
    }

    /* If selectedCustomer exists, find its updated version in the list, otherwise find 
    the next selected customer with the nextSelectedCustomerCandidateId. */
    const updatedSelectedCustomer =
      (selectedCustomer && customers.find((c) => c.id === selectedCustomer.id)) ||
      customers.find((c) => c.id === nextSelectedCustomerCandidateId);

    /* If an updated selected customer was found, set it as the selected customer. 
    Otherwise, find a new selected customer. */
    setSelectedCustomer(
      updatedSelectedCustomer || getNextSelectedCustomer(customers)
    );
  }, [customers, selectedCustomer, nextSelectedCustomerCandidateId]);

  return (
    <div className="h-full">
      {blocker.state === 'blocked' && (
        <CustomerServiceWarningModal close={() => blocker.reset()} />
      )}
      {wlPosPicker && <div className="fixed inset-0 z-10 bg-black opacity-50" />}

      <div className="relative mx-auto flex h-14 max-w-5xl items-center">
        <StatusFiltersButtons
          filters={filters}
          setStatusFilters={filterUtils.setStatuses}
        />
        <div className="border-platinum-700 absolute -left-[calc((100vw-64rem)/2)] bottom-0 w-screen border-b"></div>
      </div>

      {customers.length && selectedCustomer ? (
        <div className="mx-auto flex h-[calc(100%-3.5rem)] max-w-5xl justify-between pt-4">
          <CustomerList
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            isPastDate={!sameDay(filters.date, new Date())}
            wlPosPicker={
              wlPosPicker && {
                index: wlPosPicker.index,
                setIndex: (index: number) =>
                  setWlPosPicker({ ...wlPosPicker, index }),
                locked: wlPosPicker.locked,
                setLocked: (locked: boolean) =>
                  setWlPosPicker({ ...wlPosPicker, locked })
              }
            }
          />
          <div className={`ml-4 h-full`}>
            <CustomerPanel
              customer={selectedCustomer}
              actionEventHandlers={customerPanelActionEventHandlers!}
              styles={wlPosPicker ? 'z-10' : ''}
            />
          </div>
        </div>
      ) : (
        <div className="text-french_gray_2 flex h-[calc(100%-3.5rem)] items-center justify-center">
          No customers found
        </div>
      )}
      {error && (
        <div className={`${!wlPosPicker && 'z-20'} absolute bottom-10 right-10`}>
          <Error error={error} close={() => setError('')} />
        </div>
      )}
    </div>
  );
}
