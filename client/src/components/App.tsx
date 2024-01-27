import CustomerPanelWrapper from './CustomerPanel/Wrapper';
import { Customer, Station, StatusFilters } from '../utils/types';
import { useEffect, useState, useMemo } from 'react';
import CustomerList from './CustomerList';
import Header from './Header';
import useCustomerFilters from 'hooks/useCustomerFilters';
import CustomerController from 'utils/CustomerController';
import useCustomers from 'hooks/useCustomers';
import Error from './Error';
import { sameDay } from 'utils/helpers';
import { ActionViewConfigProp } from './CustomerPanel/ActionView/types';

// Stand-in state
const signedInStation: Station = 'MV1';

function App() {
  const apiController = useMemo(() => new CustomerController(signedInStation), []);
  const [WLPosPicker, setWLPosPicker] = useState<{
    index: number;
    locked: boolean;
  } | null>(null);
  const [savedStatusFilters, setSavedStatusFilters] = useState<StatusFilters | null>(
    null
  );
  const {
    filters: customerFilters,
    setDate,
    setDepartment,
    setStatuses
  } = useCustomerFilters();
  const { customers, loadUpdatedCustomers } = useCustomers(
    customerFilters,
    apiController
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string>('');

  // Keep selectedCustomer in sync with the customers on the screen
  useEffect(() => {
    // If there's no customers, there can be no selected customer.
    if (!customers || !customers.length) {
      setSelectedCustomer(null);
      return;
    }

    // If no selected customer, select one, prefer 'Serving', otherwise pick the first
    if (!selectedCustomer) {
      setSelectedCustomer(
        customers.find((c) => c.status === 'Serving') || customers[0]
      );
    } else {
      // If there is a selected customer, find them. If they no longer exist, set to null.
      setSelectedCustomer(
        customers.find((c) => c.id === selectedCustomer.id) || null
      );
    }
  }, [customers, selectedCustomer]);

  // Save old status filters so that when customer returns to main view, their old filters are active
  useEffect(() => {
    // If there are saved status filters, and no special conditions apply (previous date, or
    // WL pos picker active) replace the current ones with the saved, and clear clear the saved
    if (
      savedStatusFilters &&
      sameDay(customerFilters.date, new Date()) &&
      !WLPosPicker
    ) {
      setSavedStatusFilters(null);
      setStatuses({ ...savedStatusFilters });
    }
    // Save current status filters and replace with relevant filters for previous date customers
    if (!sameDay(customerFilters.date, new Date()) && !savedStatusFilters) {
      setSavedStatusFilters({ ...customerFilters.statuses });
      setStatuses({ Waiting: true, 'No Show': true });
    }
    // Save current status filters and replace with relevant filters for WL pos picker
    if (WLPosPicker && !savedStatusFilters) {
      setSavedStatusFilters({ ...customerFilters.statuses });
      setStatuses({ Waiting: true, Serving: true });
    }
  }, [
    customerFilters.date,
    customerFilters.statuses,
    setStatuses,
    savedStatusFilters,
    WLPosPicker
  ]);

  const actionBtnHandlers: ActionViewConfigProp | null = selectedCustomer && {
    delete: {
      onClick: () => null,
      onCancel: () => null,
      onConfirm: async ({ onSuccess }) => {
        const res = await apiController.delete(selectedCustomer.id);

        if (res.error) {
          setError(res.error);
        } else {
          onSuccess();
          loadUpdatedCustomers();
        }
      }
    },
    returnToWaitingList: {
      onClick: () => setWLPosPicker({ index: 0, locked: false }),
      onCancel: () => setWLPosPicker(null),
      onConfirm: async () => {
        const res = await apiController.update(selectedCustomer.id, {
          status: 'Waiting',
          waitingListIndex: WLPosPicker.index
        });
        if (res.error) {
          setError(res.error);
        } else {
          loadUpdatedCustomers();
          setWLPosPicker(null);
        }
      },
      confirmBtnDisabled: !WLPosPicker
    },
    callToStation: {
      onClick: async () => {
        if (customers.find((c) => c.status === 'Serving')) {
          setError('You are already serving a customer.');
        } else {
          const res = await apiController.callToStation(selectedCustomer.id);
          if (res.error) {
            setError(res.error);
          } else {
            loadUpdatedCustomers();
          }
        }
      }
    },
    finishServing: {
      onClick: async () => {
        const res = await apiController.update(selectedCustomer.id, {
          status: 'Served'
        });
        if (res.error) {
          setError(res.error);
        } else {
          loadUpdatedCustomers();
        }
      }
    },
    markNoShow: {
      onClick: () => null,
      onCancel: () => null,
      onConfirm: async ({ onSuccess }) => {
        const res = await apiController.update(selectedCustomer.id, {
          status: 'No Show'
        });

        if (res.error) {
          setError(res.error);
        } else {
          // TODO: Give success indication
          loadUpdatedCustomers();
          onSuccess();
        }
      }
    }
  };

  return (
    <div className="text-eerie_black relative h-screen bg-white">
      {WLPosPicker && <div className="fixed inset-0 bg-black opacity-50" />}
      <Header
        signedInStation={signedInStation}
        filters={customerFilters}
        filterSetters={{
          setDate,
          setDepartment,
          setStatuses
        }}
      />
      {customers.length && selectedCustomer ? (
        <div className="mx-auto mt-4 flex h-[calc(100%-8rem)] max-w-5xl justify-between pt-4">
          <CustomerList
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            WLPosPicker={
              WLPosPicker && {
                index: WLPosPicker.index,
                setIndex: (index: number) =>
                  setWLPosPicker({ ...WLPosPicker, index }),
                locked: WLPosPicker.locked,
                setLocked: (locked: boolean) =>
                  setWLPosPicker({ ...WLPosPicker, locked })
              }
            }
          />
          <div className="ml-4">
            <CustomerPanelWrapper
              customer={selectedCustomer}
              containerStyles={WLPosPicker ? 'z-10' : ''}
              actionConfig={actionBtnHandlers}
            />
          </div>
        </div>
      ) : (
        <div className="text-french_gray_2 flex h-[calc(100%-8rem)] items-center justify-center">
          No Customers
        </div>
      )}
      {error && (
        <div className="absolute bottom-10 right-10 ">
          <Error error={error} close={() => setError('')} />
        </div>
      )}
    </div>
  );
}

export default App;
