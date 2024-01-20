import CustomerPanelWrapper from './CustomerPanel/Wrapper';
import DateToggler from './Header/DateToggler';
import Filters from './Header/Filters';
import StationIcon from './Header/StationIcon';
import CustomerController from '../utils/CustomerController';
import { Customer, Filter, Station } from '../utils/types';
import { useEffect, useState } from 'react';
import CustomerPanelActionButton from './CustomerPanel/ActionButton';
import Confirm from './Confirm';
import CustomerList from './CustomerList';
import CustomerPanelInfo from './CustomerPanel/Info';
import { ReactElement } from 'react';
import generateCustomers from 'utils/generateCustomers';

// Stand-in state
const currentStation: Station = 'MV1';
const currentDepartment = 'Motor Vehicle';

function App() {
  const [activeFilters, setActiveFilters] = useState({
    Waiting: true,
    'No Show': false,
    Served: false
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const selectedCustomer =
    customers.length && customers.find((c) => c.id === selectedCustomerId);
  const servingCustomer =
    customers.length && customers.find((c) => c.status === 'Serving');
  const [date, setDate] = useState(new Date());
  const [panelChild, setPanelChild] = useState<ReactElement | null>(null);
  const [waitingListPosition, setWaitingListPosition] = useState<{
    index: number;
    chosen: boolean;
  } | null>(null);

  const toggleFilter = (filter: Filter) => {
    activeFilters[filter] = !activeFilters[filter];
    setActiveFilters({ ...activeFilters });
  };

  // Get customers from api when component mounts
  useEffect(() => {
    const loadCustomers = async () => {
      const { error, data } = await CustomerController.get({ date });
      if (!error && data) {
        console.log(data);
        // Find selected customer
        setSelectedCustomerId(data[0].id);
        setCustomers(data);
      } else {
        // setError(res.error)
      }
    };

    loadCustomers();
  }, [date]);

  useEffect(() => generateCustomers(), []);

  // Set the child of CustomerPanel
  useEffect(updatePanelChildEffect, [
    selectedCustomer,
    servingCustomer,
    waitingListPosition
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
          onConfirm={() => {
            console.log('Delete customer');
            displayPanelActionButtons();
          }}
          onCancel={displayPanelActionButtons}
          confirmBtnStyles="bg-red-500 text-white"
          confirmBtnText="Delete"
        />
      );
    };

    const returnToWaitingList = async () => {
      setWaitingListPosition({
        index: 0,
        chosen: false
      });
    };

    const callToStation = async () => {
      if (servingCustomer) {
        console.log('You are already serving a customer');
      } else {
        const { data, error } = await CustomerController.updateStatus(
          selectedCustomer.id,
          { status: 'Serving' }
        );
        if (!error) {
          console.log(data);
        } else {
          console.log(error);
        }
      }
    };

    const finishServing = async () => {
      const { data, error } = await CustomerController.finishServing(
        selectedCustomer.id
      );
      if (error) {
        // Show error
        console.log(data);
      } else {
        // Show success indicator
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
              const { data, error } =
                await CustomerController.callNext(currentStation);

              if (!error) {
                // setSelectedCustomerId to "Serving" customer
                console.log(data);
              } else {
                // display error
                console.log(error);
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
            const { error } = await CustomerController.markNoShow(
              selectedCustomer.id
            );

            if (error) {
              // Give error indication
              console.log(error);
            } else {
              // Give success indication
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

    if (waitingListPosition) {
      setPanelChild(
        <Confirm
          title="Return Customer to Waiting List"
          message={
            'Select where this customer should appear in the waiting list.'
          }
          onCancel={() => setWaitingListPosition(null)}
          onConfirm={async () => {
            const { error } = await CustomerController.updateWaitingListIndex({
              customerId: selectedCustomer.id,
              index: waitingListPosition.index
            });
            if (error) {
              // Show error
            } else {
              setWaitingListPosition(null);
            }
          }}
          confirmBtnDisabled={!waitingListPosition.chosen}
        />
      );
    } else {
      displayPanelActionButtons();
    }
  }

  return (
    <div className="h-screen bg-white">
      {waitingListPosition && (
        <div className="w-lvh fixed inset-0 h-lvh bg-black opacity-50" />
      )}
      <header className="h-28">
        {/* Header Row 1 */}
        <div className="border-b">
          <div className="mx-auto flex h-16 max-w-5xl justify-between">
            <h1 className="mr-4 flex items-center text-2xl font-bold">
              {currentDepartment} Customers
            </h1>
            <div className="flex items-center">
              {/* Show DateToggler if current page is customers */}
              <StationIcon
                onClick={() => {
                  console.log('station icon clicked');
                }}
                station={currentStation}
              />
            </div>
          </div>
        </div>
        {/* Header Row 2 */}
        <div className="border-b shadow-sm">
          <div className="mx-auto flex max-w-5xl justify-between py-3">
            <Filters
              activeFilters={activeFilters}
              toggleFilter={toggleFilter}
            />
            <DateToggler
              date={date}
              setDate={(newDate: Date) => setDate(newDate)}
            />
          </div>
        </div>
      </header>
      <div className="mx-auto mt-4 flex h-[calc(100%-8rem)] max-w-5xl justify-between pt-4">
        {/* Customer List */}
        {customers.length && selectedCustomer && (
          <CustomerList
            customers={customers.filter(
              !waitingListPosition
                ? (c) => c.status === 'Serving' || activeFilters[c.status]
                : (c) => c.status === 'Waiting'
            )}
            selectedCustomer={selectedCustomer}
            setSelectedCustomerId={setSelectedCustomerId}
            waitingListPositionControl={
              waitingListPosition && {
                waitingListIndex: waitingListPosition.index,
                setWaitingListIndex: (index: number) =>
                  setWaitingListPosition({ ...waitingListPosition, index }),
                positionChosen: waitingListPosition.chosen,
                setPositionChosen: (chosen: boolean) =>
                  setWaitingListPosition({ ...waitingListPosition, chosen })
              }
            }
          />
        )}
        {/* Customer Panel */}
        {selectedCustomer && (
          <div className="ml-4">
            <CustomerPanelWrapper
              customer={selectedCustomer}
              containerStyles={waitingListPosition ? 'z-10' : ''}
            >
              {panelChild}
            </CustomerPanelWrapper>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
