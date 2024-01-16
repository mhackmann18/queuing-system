import CustomerPanel from './CustomerPanel';
import DateToggler from './Header/DateToggler';
import Filters from './Header/Filters';
import StationIcon from './Header/StationIcon';
import CustomerController from './CustomerController';
import {
  Customer,
  CustomerAction,
  CustomerStatus,
  Filter,
  Station
} from './types';
import { useEffect, useState } from 'react';
import ConfirmAction from './ConfirmAction';
import CustomerList from './CustomerList';

// Stand-in state
const station: Station = 'MV1';
const department = 'Motor Vehicle';

function App() {
  const [activeFilters, setActiveFilters] = useState({
    Waiting: true,
    'No Show': false,
    Served: false
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [date, setDate] = useState(new Date());
  const selectedCustomer =
    customers.length && customers.find((c) => c.id === selectedCustomerId);

  const toggleFilter = (filter: Filter) => {
    activeFilters[filter] = !activeFilters[filter];
    setActiveFilters({ ...activeFilters });
  };

  // TODO: Add 'transfer service action'
  const actionsByStatus: Record<CustomerStatus, CustomerAction[]> = {
    Waiting: [
      {
        title: 'Call to Station',
        fn: (customer: Customer) => console.log(`Call ${customer.name}`)
      },
      {
        title: 'Delete',
        ConfirmationComponent: ({ onCancel, onConfirm }) => (
          <ConfirmAction
            onCancel={onCancel}
            onConfirm={onConfirm}
            title="Delete Customer?"
            message="This action cannot be undone."
            confirmBtnStyles="bg-red-500 text-white"
          />
        ),
        fn: async (customer: Customer) => {
          const res = await CustomerController.deleteOne(customer);

          if (!res.error) {
            setCustomers(res.data);
          }
        }
      }
    ],
    Serving: [
      {
        title: 'Finish Serving',
        fn: (customer: Customer) =>
          console.log(`Finish serving ${customer.name}`)
      },
      {
        title: 'Mark No Show',
        fn: (customer: Customer) =>
          console.log(`Mark ${customer.name} as No Show`)
      },
      {
        title: 'Return to Waiting List',
        fn: (customer: Customer) =>
          console.log(`Return ${customer.name} to Waiting List`)
      },
      {
        title: 'Delete',
        fn: (customer: Customer) =>
          console.log(`Delete customer with id ${customer.id}`)
      }
    ],
    Served: [
      {
        title: 'Return to Waiting List',
        fn: (customer: Customer) =>
          console.log(`Return ${customer.name} to Waiting List`)
      },
      {
        title: 'Delete',
        fn: (customer: Customer) =>
          console.log(`Delete customer with id ${customer.id}`)
      }
    ],
    'No Show': [
      {
        title: 'Return to Waiting List',
        fn: (customer: Customer) =>
          console.log(`Return ${customer.name} to Waiting List`)
      },
      {
        title: 'Delete',
        fn: (customer: Customer) =>
          console.log(`Delete customer with id ${customer.id}`)
      }
    ],
    'At MV1': [],
    'At MV2': [],
    'At MV3': [],
    'At MV4': [],
    'At DL1': [],
    'At DL2': []
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

  return (
    <div className="h-screen bg-white">
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
        />
        {/* Customer Panel */}
        {selectedCustomer && (
          <div className="ml-4">
            <CustomerPanel
              customer={selectedCustomer}
              customerActions={actionsByStatus[selectedCustomer.status]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
