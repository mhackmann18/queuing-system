import CustomerPanel from './CustomerPanel';
import { Customer, StatusFilters } from 'utils/types';
import { useEffect, useState, useMemo } from 'react';
import CustomerList from './CustomerList';
import Header from './Header';
import useCustomerFilters from 'hooks/useCustomerFilters';
import useCustomers from 'hooks/useCustomers';
import Error from 'components/Error';
import { sameDay, getNextSelectedCustomer } from 'utils/helpers';
import { WaitingListPositionPickerState } from 'utils/types';
import { CustomerPanelActionEventHandlers } from './CustomerPanel/types';
import DummyApi from 'utils/CustomerController/DummyApi';
import useNextCustomerId from 'hooks/useNextSelectedCustomer';

export default function CustomerManagerView() {
  // Application state
  const [wlPosPicker, setWlPosPicker] =
    useState<WaitingListPositionPickerState>(null);
  const [savedStatusFilters, setSavedStatusFilters] = useState<StatusFilters | null>(
    null
  );
  const [error, setError] = useState<string>('');
  const { filters, ...filterUtils } = useCustomerFilters();
  const { customers, fetchCustomers, controller } = useCustomers(filters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const nextSelectedCustomerCandidateId = useNextCustomerId(
    selectedCustomer,
    customers
  );

  // Load initial customers
  useEffect(() => {
    localStorage.clear();
    DummyApi.init();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    /* If a selected customer is found, set it as the selected customer. 
    Otherwise, find the next selected customer. */
    setSelectedCustomer(
      updatedSelectedCustomer || getNextSelectedCustomer(customers)
    );
  }, [customers, selectedCustomer, nextSelectedCustomerCandidateId]);

  // Save old status filters so that when customer returns to main view, their old filters are active
  useEffect(() => {
    // If there are saved status filters, and no special conditions apply (previous date, or
    // WL pos picker active) replace the current ones with the saved, and clear clear the saved
    if (savedStatusFilters && sameDay(filters.date, new Date()) && !wlPosPicker) {
      filterUtils.setStatuses({ ...savedStatusFilters });
      setSavedStatusFilters(null);
    }
    // Save current status filters and replace with relevant filters for previous date customers
    if (!sameDay(filters.date, new Date()) && !savedStatusFilters) {
      setSavedStatusFilters({ ...filters.statuses });
      filterUtils.setStatuses({ Served: true, 'No Show': true });
    }
    // Save current status filters and replace with relevant filters for WL pos picker
    if (wlPosPicker && !savedStatusFilters) {
      setSavedStatusFilters({ ...filters.statuses });
      if (selectedCustomer!.status === 'Serving') {
        filterUtils.setStatuses({ Waiting: true, Serving: true });
      } else if (selectedCustomer!.status === 'No Show') {
        filterUtils.setStatuses({ 'No Show': true, Waiting: true });
      }
    }
  }, [
    filters.date,
    filters.statuses,
    filterUtils.setStatuses,
    filterUtils,
    savedStatusFilters,
    wlPosPicker,
    selectedCustomer
  ]);

  const panelComponentActionBtnHandlers: CustomerPanelActionEventHandlers | null =
    useMemo(
      () =>
        selectedCustomer && {
          delete: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              const res = await controller.delete(selectedCustomer.id);

              if (res.error) {
                setError(res.error);
              } else {
                onSuccess();
                fetchCustomers();
              }
            }
          },
          returnToWaitingList: {
            onClick: () => {
              setWlPosPicker({ index: 0, locked: false });
            },
            onCancel: () => setWlPosPicker(null),
            onConfirm: async ({ onSuccess }) => {
              const res = await controller.update(selectedCustomer.id, {
                status: 'Waiting',
                waitingListIndex: wlPosPicker!.index
              });
              if (res.error) {
                setError(res.error);
              } else {
                onSuccess();
                fetchCustomers();
                setWlPosPicker(null);
              }
            },
            confirmBtnDisabled: !wlPosPicker?.locked
          },
          callToStation: {
            onClick: async () => {
              if (customers.find((c) => c.status === 'Serving')) {
                setError('You are already serving a customer.');
              } else if (selectedCustomer.atOtherDivision) {
                setError('Customer is being served at another division.');
              } else {
                const res = await controller.callToStation(selectedCustomer.id);
                if (res.error) {
                  setError(res.error);
                } else {
                  fetchCustomers();
                }
              }
            }
          },
          finishServing: {
            onClick: async () => {
              const res = await controller.update(selectedCustomer.id, {
                status: 'Served'
              });
              if (res.error) {
                setError(res.error);
              } else {
                fetchCustomers();
              }
            }
          },
          markNoShow: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              const res = await controller.update(selectedCustomer.id, {
                status: 'No Show'
              });

              if (res.error) {
                setError(res.error);
              } else {
                // TODO: Give success indication
                fetchCustomers();
                onSuccess();
              }
            }
          }
        },
      [wlPosPicker, controller, selectedCustomer, customers, fetchCustomers]
    );

  return (
    <>
      {wlPosPicker && <div className="fixed inset-0 z-10 bg-black opacity-50" />}

      <Header filters={filters} filterSetters={filterUtils} setError={setError} />

      {customers.length && selectedCustomer ? (
        <div className="mx-auto mt-4 flex h-[calc(100%-8rem)] max-w-5xl justify-between pt-4">
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
          <div className={`ml-4`}>
            <CustomerPanel
              customer={selectedCustomer}
              actionEventHandlers={panelComponentActionBtnHandlers!}
            />
          </div>
        </div>
      ) : (
        <div className="text-french_gray_2 flex h-[calc(100%-8rem)] items-center justify-center">
          No Customers to Show
        </div>
      )}
      {error && (
        <div className={`${!wlPosPicker && 'z-20'} absolute bottom-10 right-10`}>
          <Error error={error} close={() => setError('')} />
        </div>
      )}
    </>
  );
}