import CustomerPanelWrapper from './CustomerPanel/Wrapper';
import DateToggler from './Header/DateToggler';
import Filters from './Header/Filters';
import StationIcon from './Header/StationIcon';
import CustomerController from '../utils/CustomerController';
import { Customer, CustomerStatus, Filter, Station } from '../utils/types';
import { useEffect, useState } from 'react';
import CustomerPanelActionButton from './CustomerPanel/ActionButton';
import Confirm from './Confirm';
import CustomerList from './CustomerList';
import CustomerPanelInfo from './CustomerPanel/Info';
import { ReactElement } from 'react';
import { WaitingListPositionControl } from '../utils/types';

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
  const [selectedCustomerId, setSelectedCustomerId] = useState(1);
  const selectedCustomer =
    customers.length && customers.find((c) => c.id === selectedCustomerId);
  const [date, setDate] = useState(new Date());
  // const [selectingCustomerPosition, setSelectingCustomerPosition] =
  //   useState<boolean>(false);

  const [waitingListPositionControl, setWaitingListPositionControl] =
    useState<WaitingListPositionControl | null>(null);
  // const [customerPosition, setCustomerPosition] = useState<number | null>(null);
  const [panelChild, setPanelChild] = useState<ReactElement | null>(null);

  const toggleFilter = (filter: Filter) => {
    activeFilters[filter] = !activeFilters[filter];
    setActiveFilters({ ...activeFilters });
  };

  // Get customers from api when component mounts
  useEffect(() => {
    const loadCustomers = async () => {
      const { error, data } = await CustomerController.get({ date });
      if (!error) {
        setCustomers(data);
      } else {
        // setError(res.error)
      }
    };

    loadCustomers();
  }, [date]);

  // Determine the children of CustomerPanel
  useEffect(managePanelChild, [selectedCustomer, waitingListPositionControl]);

  function managePanelChild() {
    if (!selectedCustomer) {
      return;
    }

    const displayDeleteCustomer = () => {
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

    const returnToWaitingList = () => {
      function setWaitingListIndex(index: number) {
        setWaitingListPositionControl({
          setWaitingListIndex,
          waitingListIndex: index
        });
      }

      setWaitingListPositionControl({
        waitingListIndex: 0,
        setWaitingListIndex
      });
    };

    const actions: Record<CustomerStatus, Record<string, () => void>[]> = {
      Waiting: [
        {
          'Call to Station': async () => {
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
        },
        { Delete: displayDeleteCustomer }
      ],
      Serving: [
        {
          'Finish Serving': () => null
        },
        {
          'Mark No Show': () => null
        },
        {
          'Return to Waiting List': returnToWaitingList
        },
        {
          Delete: displayDeleteCustomer
        }
      ],
      Served: [
        {
          'Return to Waiting List': returnToWaitingList
        },
        {
          Delete: displayDeleteCustomer
        }
      ],
      'No Show': [
        {
          'Return to Waiting List': returnToWaitingList
        },
        {
          Delete: displayDeleteCustomer
        }
      ],
      'At MV1': [],
      'At MV2': [],
      'At MV3': [],
      'At MV4': [],
      'At DL1': [],
      'At DL2': []
    };

    function displayPanelActionButtons() {
      if (selectedCustomer) {
        setPanelChild(
          <div>
            <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
            <div className="mb-4">{renderActionBtns()}</div>
            <CustomerPanelInfo customer={selectedCustomer} />
          </div>
        );
      }
    }

    const renderActionBtns = () =>
      actions[selectedCustomer.status].map((action) => {
        const [actionName, actionFn] = Object.entries(action)[0];
        return (
          <CustomerPanelActionButton
            key={actionName}
            text={actionName}
            onClick={() => actionFn()}
          />
        );
      });

    if (waitingListPositionControl) {
      setPanelChild(
        <Confirm
          title="Return Customer to Waiting List"
          message={`Select which customer to place ${selectedCustomer.name} behind.`}
          onCancel={() => setWaitingListPositionControl(null)}
          onConfirm={async () => {
            const { error } = await CustomerController.updateWaitingListIndex({
              customerId: selectedCustomer.id,
              index: waitingListPositionControl.waitingListIndex
            });
            if (error) {
              // Show error
            } else {
              setWaitingListPositionControl(null);
            }
          }}
        />
      );
    } else {
      displayPanelActionButtons();
    }
  }

  return (
    <div className="h-screen bg-white">
      {waitingListPositionControl && (
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
        {customers.length && (
          <CustomerList
            customers={customers.filter(
              !waitingListPositionControl
                ? (c) => c.status === 'Serving' || activeFilters[c.status]
                : (c) => c.status === 'Waiting'
            )}
            selectedCustomer={selectedCustomer}
            setSelectedCustomerId={setSelectedCustomerId}
            waitingListPositionControl={waitingListPositionControl || undefined}
          />
        )}
        {/* Customer Panel */}
        {selectedCustomer && (
          <div className="ml-4">
            <CustomerPanelWrapper
              customer={selectedCustomer}
              containerStyles={waitingListPositionControl ? 'z-10' : ''}
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
