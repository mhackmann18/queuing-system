import CustomerPanelWrapper from './CustomerPanel/Wrapper';
import { Customer, Station } from '../utils/types';
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

// Stand-in state
const currentStation: Station = 'MV1';

function App() {
  const apiController = useMemo(() => new CustomerController(currentStation), []);
  // Should be null when position picker is inactive
  const [WLPosPicker, setWLPosPicker] = useState<{
    index: number;
    locked: boolean;
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

  // Keep selectedCustomer in sync with the customers on the screen
  useEffect(() => {
    if (customers && customers.length) {
      const foundSelectedCustomer =
        selectedCustomer && customers.find((c) => c.id === selectedCustomer.id);

      if (!foundSelectedCustomer) {
        const servingCustomer = customers.find((c) => c.status === 'Serving');

        if (servingCustomer) {
          setSelectedCustomer(servingCustomer);
        } else {
          setSelectedCustomer(customers[0]);
        }
      } else {
        setSelectedCustomer(foundSelectedCustomer);
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [customers, selectedCustomer]);

  // Set the child of CustomerPanel
  useEffect(updatePanelChildEffect, [
    selectedCustomer,
    servingCustomer,
    WLPosPicker,
    loadUpdatedCustomers,
    apiController
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
            const { data, error } = await apiController.delete(selectedCustomer.id);
            if (data) {
              loadUpdatedCustomers();
            } else {
              // TODO Display error
              console.log(error);
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
        locked: false
      });
    };

    const callToStation = async () => {
      // Can't serve two customers at once
      if (servingCustomer) {
        // TODO display error
        console.log('You are already serving a customer');
      } else {
        const { data, error } = await apiController.callToStation(
          selectedCustomer.id
        );
        if (data) {
          loadUpdatedCustomers();
        } else {
          // TODO display error
          console.log(error);
        }
      }
    };

    const finishServing = async () => {
      const { data, error } = await apiController.update(selectedCustomer.id, {
        status: 'Served'
      });
      if (data) {
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
              const { data, error } = await apiController.callNext();

              if (!error) {
                // setSelectedCustomerId to "Serving" customer
                loadUpdatedCustomers();

                console.log(data);
              } else {
                // display error
                console.log(error);
                displayPanelActionButtons();
              }
            }}
          />
        );
      } else {
        // TODO show error
        console.log(error);
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
            const { error } = await apiController.update(selectedCustomer.id, {
              status: 'No Show'
            });

            if (error) {
              // Give error indication
              console.log(error);
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
          onCancel={() => setWLPosPicker(null)}
          onConfirm={async () => {
            console.log(WLPosPicker.index);
            const { error } = await apiController.update(selectedCustomer.id, {
              status: 'Waiting',
              waitingListIndex: WLPosPicker.index
            });
            if (error) {
              // Show error
            } else {
              loadUpdatedCustomers();
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
    <div className="h-screen bg-white">
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
    </div>
  );
}

export default App;
