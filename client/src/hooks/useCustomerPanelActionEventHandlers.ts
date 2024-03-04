import { useMemo, useContext } from 'react';
import { CustomerPanelActionEventHandlers } from 'components/CustomerManagerView/CustomerPanel/types';
import { Customer } from 'utils/types';
import { usePatchCustomer, useDeleteCustomer } from 'hooks/apiHooks';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';

export default function usePanelComponentActionBtnHandlers(
  selectedCustomer: Customer | null,
  customers: Customer[],
  wlPosPicker: { index: number; locked: boolean } | null,
  setWlPosPicker: (pos: { index: number; locked: boolean } | null) => void,
  setError: (error: string) => void
): CustomerPanelActionEventHandlers | null {
  const { desk } = useContext(DeskContext);
  const { number: deskNum, divisionName } = desk!;
  const { patchCustomer } = usePatchCustomer();
  const { deleteCustomer } = useDeleteCustomer();
  const customerPanelActionEventHandlers: CustomerPanelActionEventHandlers | null =
    useMemo(
      () =>
        selectedCustomer && {
          delete: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              const { data, error } = await deleteCustomer(selectedCustomer.id);

              if (error) {
                setError(error);
              } else if (data) {
                onSuccess();
                // fetchCustomers();
              }
            }
          },
          returnToWaitingList: {
            onClick: () => {
              setWlPosPicker({ index: 0, locked: false });
            },
            onCancel: () => setWlPosPicker(null),
            onConfirm: async ({ onSuccess }) => {
              const { data, error } = await patchCustomer(selectedCustomer.id, {
                divisions: [
                  {
                    name: divisionName,
                    status: 'Waiting',
                    waitingListIndex: wlPosPicker!.index + 1
                  }
                ]
              });

              if (error) {
                setError(error);
              } else if (data) {
                onSuccess();
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
                const { data, error } = await patchCustomer(selectedCustomer.id, {
                  divisions: [
                    {
                      name: divisionName,
                      status: `Desk ${deskNum}`
                    }
                  ]
                });

                if (error) {
                  setError(error);
                } else if (data) {
                  console.log(data);
                }
              }
            }
          },
          finishServing: {
            onClick: async () => {
              const { data, error } = await patchCustomer(selectedCustomer.id, {
                divisions: [
                  {
                    name: divisionName,
                    status: 'Served'
                  }
                ]
              });

              if (error) {
                setError(error);
              } else if (data) {
                console.log(data);
              }
            }
          },
          markNoShow: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              const { data, error } = await patchCustomer(selectedCustomer.id, {
                divisions: [
                  {
                    name: divisionName,
                    status: 'No Show'
                  }
                ]
              });

              if (error) {
                setError(error);
              } else if (data) {
                // TODO: Give success indication
                onSuccess();
              }
            }
          }
        },
      [
        selectedCustomer,
        wlPosPicker,
        setError,
        setWlPosPicker,
        customers,
        deskNum,
        divisionName,
        patchCustomer,
        deleteCustomer
      ]
    );

  return customerPanelActionEventHandlers;
}
