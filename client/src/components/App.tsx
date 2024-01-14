import CustomerPanel from './CustomerPanel';
import CustomerRow from './CustomerRow';
import DateToggler from './Header/DateToggler';
import Filters from './Header/Filters';
import StationIcon from './Header/StationIcon';
import customers from './customers';
import {
  Customer,
  CustomerAction,
  CustomerStatus,
  Filter,
  Station
} from './types';
import { useState } from 'react';

// TODO: Add 'transfer service action'
const actionsByStatus: Record<CustomerStatus, CustomerAction[]> = {
  Waiting: [
    {
      title: 'Call to Station',
      fn: (customer: Customer) => console.log(`Call ${customer.name}`)
    },
    {
      title: 'Delete',
      fn: (customer: Customer) =>
        console.log(`Delete customer with id ${customer.id}`)
    }
  ],
  Serving: [
    {
      title: 'Finish Serving',
      fn: (customer: Customer) => console.log(`Finish serving ${customer.name}`)
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
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const toggleFilter = (filter: Filter) => {
    activeFilters[filter] = !activeFilters[filter];
    setActiveFilters({ ...activeFilters });
  };

  function getCustomerItems(c: Customer) {
    if (c.status === 'Serving' || activeFilters[c.status]) {
      return (
        <li key={c.id} className="mb-1">
          <CustomerRow
            customer={c}
            onClick={(customer) => setSelectedCustomerId(customer.id)}
            selected={Boolean(c.id === selectedCustomerId)}
          />
        </li>
      );
    }
  }

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
              date={new Date()}
              setDate={(date: Date) => console.log(date)}
            />
          </div>
        </div>
      </header>
      <div className="mx-auto mt-4 flex h-[calc(100%-8rem)] max-w-5xl justify-between pt-4">
        {/* Customer List */}
        <div className="mr-4 flex grow flex-col">
          <div className="mb-1 flex justify-between pl-4 pr-5 text-sm font-semibold">
            <div>
              <span className="inline-block w-20">Status</span>
              <span className="inline-block w-52 pl-1">Customer Name</span>
            </div>
            <div>
              <span className="inline-block w-32">Check In Time</span>
              <span className="inline-block w-24">Time Called</span>
            </div>
          </div>
          <ul className="grow overflow-y-scroll border p-2">
            {customers.map(getCustomerItems)}
          </ul>
        </div>
        {/* Customer Panel */}
        <div>
          {selectedCustomer && (
            <CustomerPanel
              customer={selectedCustomer}
              customerActions={actionsByStatus[selectedCustomer.status]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
