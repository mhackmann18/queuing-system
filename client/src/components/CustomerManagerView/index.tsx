import CustomerPanel from './CustomerPanel';
import { Customer, StatusFilters } from 'utils/types';
import { useEffect, useState, useMemo } from 'react';
import CustomerList from './CustomerList';
import Header from './Header';
import useCustomerFilters from 'hooks/useCustomerFilters';
import useCustomers from 'hooks/useCustomers';
import Error from 'components/Error';
import { sameDay } from 'utils/helpers';
import { ActionViewConfigProp } from 'components/CustomerManagerView/CustomerPanel/ActionView/types';
import { WaitingListPositionPickerState } from 'utils/types';
import ActionView from './CustomerPanel/ActionView';

export default function CustomerManagerView() {
  // Application state
  const [wlPosPicker, setWlPosPicker] =
    useState<WaitingListPositionPickerState>(null);
  const [savedStatusFilters, setSavedStatusFilters] = useState<StatusFilters | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string>('');
  const { filters, ...filterUtils } = useCustomerFilters();
  const { customers, fetchCustomers, controller } = useCustomers(filters);

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
        customers.find((c) => c.id === selectedCustomer.id) ||
          customers.find((c) => c.status === 'Serving') ||
          customers[0]
      );
    }
  }, [customers, selectedCustomer]);

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

  const panelComponentActionBtnHandlers: ActionViewConfigProp | null = useMemo(
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
            } else if (selectedCustomer.atOtherDept) {
              setError('Customer is being served at another department.');
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
            <CustomerPanel customer={selectedCustomer}>
              <ActionView
                customer={selectedCustomer}
                actionConfig={panelComponentActionBtnHandlers}
                currentDept={filters.department}
              />
            </CustomerPanel>
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
