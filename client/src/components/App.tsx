import CustomerPanel from './CustomerPanel';
import CustomerRow from './CustomerRow';
import FilterButton from './FilterButton';
import { Customer, CustomerAction } from './types';
import { useState } from 'react';

const fn = () => console.log('run dummy function');

const selectedCustomerId = 1;

const customers: Customer[] = [
  {
    id: 101,
    status: 'No Show',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 102,
    status: 'Served',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 103,
    status: 'Served',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 1,
    status: 'Serving',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()],
    reasonsForVisit: ['Motor Vehicle', "Driver's License"]
  },
  {
    id: 2,
    status: 'At MV1',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 21,
    status: 'At MV2',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 22,
    status: 'At MV3',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 23,
    status: 'At MV4',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 25,
    status: 'At DL1',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 24,
    status: 'At DL2',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 3,
    status: 'Waiting',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  },
  {
    id: 4,
    status: 'Waiting',
    name: 'John Doe',
    checkInTime: new Date(),
    callTimes: [new Date()]
  }
];

const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

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

function App() {
  const [activeFilters, setActiveFilters] = useState({
    Waiting: true,
    'No Show': false,
    Served: false
  });

  const toggleFilter = (filterName: string) => {
    activeFilters[filterName] = !activeFilters[filterName];

    setActiveFilters({ ...activeFilters });
  };

  function getCustomerItems(c: Customer) {
    if (!activeFilters[c.status] && c.status !== 'Serving') {
      return;
    }
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

  return (
    <div className="h-screen bg-white">
      <header className="h-28">
        {/* Header Row 1 */}
        <div className="border-b">
          <div className="mx-auto flex max-w-5xl justify-between">
            <div>
              <h1 className="text-2xl font-bold">Motor Vehicle Customers</h1>
            </div>
            <div>
              <span>9:31 AM</span>
              <div>MV1</div>
            </div>
          </div>
        </div>
        {/* Header Row 2 */}
        <div className="border-b shadow-sm">
          <div className="mx-auto max-w-5xl py-3">
            <span className="mr-2 inline-block border-r pr-2 font-semibold">
              Filter By Status
            </span>
            <ul className="inline-block">
              <li className="mr-2 inline-block">
                <FilterButton
                  text="Waiting"
                  onClick={() => toggleFilter('Waiting')}
                  active={activeFilters.Waiting}
                />
              </li>
              <li className="mr-2 inline-block">
                <FilterButton
                  text="No Show"
                  onClick={() => toggleFilter('No Show')}
                  active={activeFilters['No Show']}
                />
              </li>
              <li className="mr-2 inline-block">
                <FilterButton
                  text="Served"
                  onClick={() => toggleFilter('Served')}
                  active={activeFilters['Served']}
                />
              </li>
            </ul>
          </div>
        </div>
      </header>
      <div className="mx-auto flex h-[calc(100%-7rem)] max-w-5xl justify-between pt-4">
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
