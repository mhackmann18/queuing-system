import { useMemo, useContext } from 'react';
import { CustomerPanelActionEventHandlers } from 'components/CustomerManagerView/CustomerPanel/types';
import { Customer } from 'utils/types';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';
import useAuth from './useAuth';
import useOffice from './useOffice';
import api from 'utils/api';

export default function usePanelComponentActionBtnHandlers(
  selectedCustomer: Customer | null,
  customers: Customer[],
  wlPosPicker: { index: number; locked: boolean } | null,
  setWlPosPicker: (pos: { index: number; locked: boolean } | null) => void,
  setError: (error: string) => void
): CustomerPanelActionEventHandlers | null {
  const { desk } = useContext(DeskContext);
  const { number: deskNum, divisionName } = desk!;
  const { token } = useAuth();
  const { id: officeId } = useOffice();

  const customerPanelActionEventHandlers: CustomerPanelActionEventHandlers | null =
    useMemo(
      () =>
        selectedCustomer && {
          delete: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              try {
                await api.deleteCustomer(officeId, selectedCustomer.id, token);
                onSuccess();
              } catch (error) {
                if (error instanceof Error) {
                  setError(error.message);
                }
              }
            }
          },
          returnToWaitingList: {
            onClick: () => {
              setWlPosPicker({ index: 0, locked: false });
            },
            onCancel: () => setWlPosPicker(null),
            onConfirm: async ({ onSuccess }) => {
              try {
                api.patchCustomer(
                  officeId,
                  selectedCustomer.id,
                  {
                    divisions: [
                      {
                        name: divisionName,
                        status: 'Waiting',
                        // Database waiting list indexes are 1-based
                        waitingListIndex: wlPosPicker!.index + 1
                      }
                    ]
                  },
                  token
                );

                onSuccess();
                setWlPosPicker(null);
              } catch (error) {
                if (error instanceof Error) {
                  setError(error.message);
                }
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
                try {
                  await api.patchCustomer(
                    officeId,
                    selectedCustomer.id,
                    {
                      divisions: [
                        {
                          name: divisionName,
                          status: `Desk ${deskNum}`
                        }
                      ]
                    },
                    token
                  );
                } catch (error) {
                  if (error instanceof Error) {
                    setError(error.message);
                  }
                }
              }
            }
          },
          finishServing: {
            onClick: async () => {
              try {
                await api.patchCustomer(
                  officeId,
                  selectedCustomer.id,
                  {
                    divisions: [
                      {
                        name: divisionName,
                        status: 'Served'
                      }
                    ]
                  },
                  token
                );
              } catch (error) {
                if (error instanceof Error) {
                  setError(error.message);
                }
              }
            }
          },
          markNoShow: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              try {
                await api.patchCustomer(
                  officeId,
                  selectedCustomer.id,
                  {
                    divisions: [
                      {
                        name: divisionName,
                        status: 'No Show'
                      }
                    ]
                  },
                  token
                );
                onSuccess();
              } catch (error) {
                if (error instanceof Error) {
                  setError(error.message);
                }
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
        token,
        officeId
      ]
    );

  return customerPanelActionEventHandlers;
}
