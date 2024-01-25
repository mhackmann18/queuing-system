import CustomerPanelWrapper from './CustomerPanel/Wrapper';
import { Customer, Station, StatusFilters } from '../utils/types';
import { useEffect, useState, useMemo } from 'react';
import CustomerPanelActionButton from './CustomerPanel/ActionButton';
import Confirm from './Confirm';
import CustomerList from './CustomerList';
import CustomerPanelInfo from './CustomerPanel/Info';
import { ReactElement } from 'react';
import Header from './Header';
import useCustomerFilters from 'hooks/useCustomerFilters';
import CustomerController from 'utils/CustomerController';
import useCustomers from 'hooks/useCustomers';
import Error from './Error';

// Stand-in state
const currentStation: Station = 'MV1';

function App() {
  const apiController = useMemo(() => new CustomerController(currentStation), []);
  const [WLPosPicker, setWLPosPicker] = useState<{
    index: number;
    locked: boolean;
    savedStatusFilters: StatusFilters;
  } | null>(null);
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
  const servingCustomer =
    customers.length && customers.find((c) => c.status === 'Serving');
  const [panelChild, setPanelChild] = useState<ReactElement | null>(null);
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

  // Determine content of CustomerPanel
  useEffect(updatePanelChildEffect, [
    selectedCustomer,
    servingCustomer,
    WLPosPicker,
    loadUpdatedCustomers,
    apiController,
    customerFilters.statuses,
    setStatuses
  ]);

  function updatePanelChildEffect() {
    if (!selectedCustomer) {
      return;
    }

    const deleteCustomer = async () => {
      setPanelChild(
        <Confirm
          title="Delete Customer"
          message="Are you sure you want to delete this customer?"
          onConfirm={async () => {
            const res = await apiController.delete(selectedCustomer.id);
            if (res.data) {
              loadUpdatedCustomers();
            }
            if (res.error) {
              setError(res.error);
            }
            displayPanelActionButtons();
          }}
          onCancel={displayPanelActionButtons}
          confirmBtnStyles="bg-red-500 text-white"
          confirmBtnText="Delete"
        />
      );
    };

    const returnToWaitingList = async () => {
      // Switches panel to WL position picker
      setWLPosPicker({
        index: 0,
        locked: false,
        savedStatusFilters: { ...customerFilters.statuses }
      });
      setStatuses({ Waiting: true, Serving: true });
    };

    const callToStation = async () => {
      // Can't serve two customers at once
      if (servingCustomer) {
        setError('You are already serving a customer.');
      } else {
        const res = await apiController.callToStation(selectedCustomer.id);
        if (res.data) {
          loadUpdatedCustomers();
        }
        if (res.error) {
          setError(res.error);
        }
      }
    };

    const finishServing = async () => {
      const res = await apiController.update(selectedCustomer.id, {
        status: 'Served'
      });
      if (res.data) {
        // Show error
        setPanelChild(
          <Confirm
            title={'Call Next Customer?'}
            message={
              'Would you like to call the next customer in the waiting list to your station?'
            }
            cancelBtnText="No"
            onCancel={displayPanelActionButtons}
            confirmBtnStyles="bg-serving text-white"
            confirmBtnText="Yes"
            onConfirm={async () => {
              const resp = await apiController.callNext();

              if (!resp.error) {
                // setSelectedCustomerId to "Serving" customer
                loadUpdatedCustomers();

                console.log(resp.data);
              } else {
                // display error
                setError(resp.error);
                displayPanelActionButtons();
              }
            }}
          />
        );
      } else if (res.error) {
        setError(res.error);
      }
    };

    const markNoShow = async () => {
      setPanelChild(
        <Confirm
          title={'Mark Customer as a No Show?'}
          message={
            'Marking this customer as a no show will remove them from the waiting list and require them to re-check in.'
          }
          onCancel={displayPanelActionButtons}
          confirmBtnText="Mark No Show"
          onConfirm={async () => {
            const res = await apiController.update(selectedCustomer.id, {
              status: 'No Show'
            });

            if (res.error) {
              // Give error indication
              setError(res.error);
            } else {
              // Give success indication
              loadUpdatedCustomers();
              displayPanelActionButtons();
            }
          }}
        />
      );
    };

    const getAvailableActions = (
      customer: Customer
    ): Record<string, () => Promise<void>>[] => {
      let actions: Record<string, () => Promise<void>>[] = [];
      const { status, callTimes } = customer;

      switch (status) {
        case 'Waiting':
          actions.push({
            'Call to Station': callToStation
          });
          if (callTimes.length) {
            actions.push({ 'Mark No Show': markNoShow });
          }
          actions.push({ Delete: deleteCustomer });
          break;
        case 'Serving':
          actions = [
            {
              'Finish Serving': finishServing
            },
            {
              'Mark No Show': markNoShow
            },
            {
              'Return to Waiting List': returnToWaitingList
            },
            {
              Delete: deleteCustomer
            }
          ];
          break;
        case 'Served':
          actions = [
            {
              Delete: deleteCustomer
            }
          ];
          break;
        case 'No Show':
          actions = [
            {
              'Return to Waiting List': returnToWaitingList
            },
            {
              Delete: deleteCustomer
            }
          ];
          break;
        default:
          actions = [];
      }

      return actions;
    };

    const displayPanelActionButtons = () => {
      if (selectedCustomer) {
        const renderActionBtns = () =>
          getAvailableActions(selectedCustomer).map((action) => {
            const [actionName, actionFn] = Object.entries(action)[0];
            return (
              <CustomerPanelActionButton
                key={actionName}
                text={actionName}
                onClick={() => actionFn()}
              />
            );
          });

        setPanelChild(
          <div>
            <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
            <div className="mb-4">{renderActionBtns()}</div>
            <CustomerPanelInfo customer={selectedCustomer} />
          </div>
        );
      }
    };

    if (WLPosPicker) {
      setPanelChild(
        <Confirm
          title="Return Customer to Waiting List"
          message={'Select where this customer should appear in the waiting list.'}
          onCancel={() => {
            setStatuses({ ...WLPosPicker.savedStatusFilters });
            setWLPosPicker(null);
          }}
          onConfirm={async () => {
            const res = await apiController.update(selectedCustomer.id, {
              status: 'Waiting',
              waitingListIndex: WLPosPicker.index
            });
            if (res.error) {
              setError(res.error);
            } else {
              loadUpdatedCustomers();
              setStatuses({ ...WLPosPicker.savedStatusFilters });
              setWLPosPicker(null);
            }
          }}
          confirmBtnDisabled={!WLPosPicker.locked}
        />
      );
    } else {
      displayPanelActionButtons();
    }
  }

  return (
    <div className="text-eerie_black relative h-screen bg-white">
      {WLPosPicker && (
        <div className="w-lvh fixed inset-0 h-lvh bg-black opacity-50" />
      )}
      <Header
        signedInStation={currentStation}
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
            >
              {panelChild}
            </CustomerPanelWrapper>
          </div>
        </div>
      ) : (
        'No Customers'
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
