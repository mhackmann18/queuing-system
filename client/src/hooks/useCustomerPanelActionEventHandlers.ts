import { useMemo } from 'react';
import { CustomerPanelActionEventHandlers } from 'components/CustomerManagerView/CustomerPanel/types';
import { Customer } from 'utils/types';
import CustomerController from 'utils/CustomerController';

export default function usePanelComponentActionBtnHandlers(
  selectedCustomer: Customer | null,
  controller: CustomerController,
  customers: Customer[],
  wlPosPicker: { index: number; locked: boolean } | null,
  setWlPosPicker: (pos: { index: number; locked: boolean } | null) => void,
  setError: (error: string) => void,
  fetchCustomers: () => void
): CustomerPanelActionEventHandlers | null {
  const customerPanelActionEventHandlers: CustomerPanelActionEventHandlers | null =
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
      [
        selectedCustomer,
        wlPosPicker,
        controller,
        setError,
        fetchCustomers,
        setWlPosPicker,
        customers
      ]
    );

  return customerPanelActionEventHandlers;
}
