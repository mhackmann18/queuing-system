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
import { getDeptFromStation, sameDay } from 'utils/helpers';

// Stand-in state
const signedInStation: Station = 'MV1';
const signedInDept = getDeptFromStation(signedInStation);

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
    customerFilters.department,
    setStatuses
  ]);

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
        locked: false
      });
    };

    const callToStation = async () => {
      // Can't serve two customers at once
      if (servingCustomer) {
        setError('You are already serving a customer.');
      } else {
        const res = await apiController.callToStation(selectedCustomer.id);
        if (res.error) {
          setError(res.error);
        } else {
          loadUpdatedCustomers();
        }
      }
    };

    const finishServing = async () => {
      const res = await apiController.update(selectedCustomer.id, {
        status: 'Served'
      });
      if (res.error) {
        setError(res.error);
      } else {
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
                loadUpdatedCustomers();
              } else {
                setError(resp.error);
                displayPanelActionButtons();
              }
            }}
          />
        );
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
              setError(res.error);
            } else {
              // TODO: Give success indication
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
      // If the customers don't belong to the signed in dept, no actions can be taken
      if (signedInDept !== customerFilters.department) {
        return [];
      }

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
            {customerFilters.department === signedInDept && (
              <>
                <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
                <div className="mb-4">{renderActionBtns()}</div>
              </>
            )}
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
            >
              {panelChild}
            </CustomerPanelWrapper>
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
