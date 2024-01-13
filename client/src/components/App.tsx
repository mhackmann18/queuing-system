import CustomerPanel from './CustomerPanel';
import CustomerRow from './CustomerRow';
import DateToggler from './Header/DateToggler';
import Filters from './Header/Filters';
import StationIcon from './Header/StationIcon';
import customers from './customers';
import { Customer, CustomerAction, Filter, Station } from './types';
import { useState } from 'react';

const fn = () => console.log('run dummy function');
const customerActions: CustomerAction[] = [
  {
    title: 'Finish Serving',
    fn: (customer: Customer) => console.log(`Finish serving ${customer.name}`)
  },
  {
    title: 'Call Customer',
    fn: (customer: Customer) => console.log(`Call ${customer.name}`)
  },
  {
    title: 'Mark as No Show',
    fn: (customer: Customer) => console.log(`Mark ${customer.name} as No Show`)
  },
  {
    title: 'Return to Waiting List',
    fn: (customer: Customer) =>
      console.log(`Return ${customer.name} to Waiting List`)
  },
  {
    title: 'Transfer Service',
    fn: (customer: Customer) =>
      console.log(`Transfer service of ${customer.name}`)
  }
];

// Stand-in state
const selectedCustomerId = 1;
const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
const station: Station = 'MV1';

function App() {
  const [activeFilters, setActiveFilters] = useState({
    Waiting: true,
    'No Show': false,
    Served: false
  });

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
            onClick={fn}
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
              Customers
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
            <DateToggler date={new Date()} />
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
              customerActions={customerActions}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
