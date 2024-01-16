import CustomerPanel from './CustomerPanel';
import DateToggler from './Header/DateToggler';
import Filters from './Header/Filters';
import StationIcon from './Header/StationIcon';
import CustomerController from './CustomerController';
import { Customer, CustomerStatus, Filter, Station } from './types';
import { ReactEventHandler, useEffect, useState } from 'react';
import ConfirmAction from './ConfirmAction';
import CustomerList from './CustomerList';
import CustomerInfo from './CustomerPanel/CustomerInfo';
import { ReactElement } from 'react';

// Stand-in state
const station: Station = 'MV1';
const department = 'Motor Vehicle';

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
  const [selectingCustomerPosition, setSelectingCustomerPosition] =
    useState<boolean>(false);
  const [customerPosition, setCustomerPosition] = useState<number | null>(null);
  const [panelChild, setPanelChild] = useState<ReactElement | null>(null);

  const toggleFilter = (filter: Filter) => {
    activeFilters[filter] = !activeFilters[filter];
    setActiveFilters({ ...activeFilters });
  };

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

  useEffect(() => {
    if (selectedCustomer) {
      const ActionButton = ({
        text,
        onClick
      }: {
        text: string;
        onClick: ReactEventHandler;
      }) => {
        return (
          <button
            onClick={onClick}
            className=" bg-french_gray_1-700 text-onyx mt-2 block w-full rounded-md border 
px-3 py-2 text-left text-sm font-semibold"
          >
            {text}
          </button>
        );
      };

      const actions: Record<CustomerStatus, Record<string, () => void>[]> = {
        Waiting: [
          {
            'Call to Station': () => null
          },
          { Delete: () => null }
        ],
        Serving: [
          {
            'Finish Serving': () => null
          },
          {
            'Mark No Show': () => null
          },
          {
            'Return to Waiting List': () => setSelectingCustomerPosition(true)
          },
          {
            Delete: () => null
          }
        ],
        Served: [
          {
            'Return to Waiting List': () => null
          },
          {
            Delete: () => null
          }
        ],
        'No Show': [
          {
            'Return to Waiting List': () => null
          },
          {
            Delete: () => null
          }
        ],
        'At MV1': [],
        'At MV2': [],
        'At MV3': [],
        'At MV4': [],
        'At DL1': [],
        'At DL2': []
      };

      const renderActionBtns = () =>
        actions[selectedCustomer.status].map((action) => {
          const [actionName, actionFn] = Object.entries(action)[0];
          return (
            <ActionButton
              key={actionName}
              text={actionName}
              onClick={() => actionFn()}
            />
          );
        });

      if (selectingCustomerPosition) {
        setPanelChild(
          <ConfirmAction
            title="Return Customer to Waiting List"
            message="Select where to place this customer."
            onCancel={() => setSelectingCustomerPosition(false)}
            onConfirm={() =>
              console.log(
                `Place ${selectedCustomer.name} at position ${customerPosition}`
              )
            }
            confirmBtnDisabled={!customerPosition}
          />
        );
      } else {
        setCustomerPosition(null);
        setPanelChild(
          <div>
            <h3 className="text-eerie_black mt-2 font-semibold">Actions</h3>
            <div className="mb-4">{renderActionBtns()}</div>
            <CustomerInfo customer={selectedCustomer} />
          </div>
        );
      }
    }
  }, [selectedCustomer, customerPosition, selectingCustomerPosition]);

  return (
    <div className="h-screen bg-white">
      {selectingCustomerPosition && <DarkOverlay />}
      <header className="h-28">
        {/* Header Row 1 */}
        <div className="border-b">
          <div className="mx-auto flex h-16 max-w-5xl justify-between">
            <h1 className="mr-4 flex items-center text-2xl font-bold">
              {department} Customers
            </h1>
            <div className="flex items-center">
              {/* Show DateToggler if current page is customers */}
              <StationIcon
                onClick={() => {
                  console.log('station icon clicked');
                }}
                station={station}
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
        <CustomerList
          customers={customers.filter(
            (c) => c.status === 'Serving' || activeFilters[c.status]
          )}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          selectingCustomerPosition={selectingCustomerPosition}
          setCustomerPosition={setCustomerPosition}
        />
        {/* Customer Panel */}
        {selectedCustomer && (
          <div className="ml-4">
            <CustomerPanel
              customer={selectedCustomer}
              containerStyles={selectingCustomerPosition ? 'z-10' : ''}
            >
              {panelChild}
            </CustomerPanel>
          </div>
        )}
      </div>
    </div>
  );
}

function DarkOverlay() {
  return <div className="w-lvh fixed inset-0 h-lvh bg-black opacity-50"></div>;
}

export default App;
