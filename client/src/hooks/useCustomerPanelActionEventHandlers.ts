import { useMemo } from 'react';
import { CustomerPanelActionEventHandlers } from 'components/CustomerManagerView/CustomerPanel/types';
import { Customer } from 'utils/types';
import useDesk from './useDesk';
import useOffice from './useOffice';

export default function usePanelComponentActionBtnHandlers(
  selectedCustomer: Customer | null,
  customers: Customer[],
  wlPosPicker: { index: number; locked: boolean } | null,
  setWlPosPicker: (pos: { index: number; locked: boolean } | null) => void,
  setError: (error: string) => void
): CustomerPanelActionEventHandlers | null {
  const { desk } = useDesk();
  const { number: deskNum, divisionName } = desk!;
  const { id: officeId } = useOffice();
  const customerPanelActionEventHandlers: CustomerPanelActionEventHandlers | null =
    useMemo(
      () =>
        selectedCustomer && {
          delete: {
            onClick: () => null,
            onCancel: () => null,
            onConfirm: async ({ onSuccess }) => {
              const res = await fetch(
                `http://localhost:5274/api/v1/offices/${officeId}/customers/${selectedCustomer.id}`,
                {
                  method: 'DELETE'
                }
              );

              const { data, error } = await res.json();

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
              const res = await fetch(
                `http://localhost:5274/api/v1/offices/${officeId}/customers/${selectedCustomer.id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    divisions: [
                      {
                        name: divisionName,
                        status: 'Waiting',
                        waitingListIndex: wlPosPicker!.index + 1
                      }
                    ]
                  })
                }
              );

              const { data, error } = await res.json();

              console.log(wlPosPicker?.index);

              if (error) {
                setError(error);
              } else if (data) {
                onSuccess();
                // fetchCustomers();
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
                console.log(
                  JSON.stringify({
                    divisions: [
                      {
                        name: divisionName,
                        status: `Desk ${deskNum}`
                      }
                    ]
                  })
                );
                const res = await fetch(
                  `http://localhost:5274/api/v1/offices/${officeId}/customers/${selectedCustomer.id}`,
                  {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      divisions: [
                        {
                          name: divisionName,
                          status: `Desk ${deskNum}`
                        }
                      ]
                    })
                  }
                );

                const { data, error } = await res.json();

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
              const res = await fetch(
                `http://localhost:5274/api/v1/offices/${officeId}/customers/${selectedCustomer.id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    divisions: [
                      {
                        name: divisionName,
                        status: 'Served'
                      }
                    ]
                  })
                }
              );

              const { data, error } = await res.json();

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
              const res = await fetch(
                `http://localhost:5274/api/v1/offices/${officeId}/customers/${selectedCustomer.id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    divisions: [
                      {
                        name: divisionName,
                        status: 'No Show'
                      }
                    ]
                  })
                }
              );

              const { data, error } = await res.json();

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
        officeId
      ]
    );

  return customerPanelActionEventHandlers;
}
