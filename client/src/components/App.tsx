import CustomerItem from './CustomerItem';
import FilterButton from './FilterButton';
import { Customer } from './types';

const fn = () => console.log('run dummy function');

const customers: Customer[] = [
  {
    id: 101,
    status: 'No Show',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 102,
    status: 'Served',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 103,
    status: 'Served',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 1,
    status: 'Serving',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 2,
    status: 'At MV1',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 21,
    status: 'At MV2',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 22,
    status: 'At MV3',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 23,
    status: 'At MV4',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 25,
    status: 'At DL1',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 24,
    status: 'At DL2',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 3,
    status: 'Waiting',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  },
  {
    id: 4,
    status: 'Waiting',
    name: 'John Doe',
    checkInTime: new Date(),
    callTime: new Date()
  }
];

function App() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="flex justify-between border-b px-16 py-4">
        <div>
          <h1 className="text-2xl font-bold">Motor Vehicle Customers</h1>
        </div>
        <div>
          <span>9:31 AM</span>
          <div>MV1</div>
        </div>
      </div>
      <div className="border-b py-3 pl-16 shadow-sm">
        <span className="mr-2 inline-block border-r pr-2 font-semibold">
          Filter By Status
        </span>
        <ul className="inline-block">
          <li className="mr-2 inline-block">
            <FilterButton text="Waiting" onClick={fn} active={true} />
          </li>
          <li className="mr-2 inline-block">
            <FilterButton text="No Show" onClick={fn} />
          </li>
          <li className="mr-2 inline-block">
            <FilterButton text="Served" onClick={fn} />
          </li>
          <li className="mr-2 inline-block">
            <FilterButton text="At Other Station" onClick={fn} />
          </li>
        </ul>
      </div>
      <div className="mx-32 my-4">
        <div className="mb-1 flex justify-between text-sm font-semibold">
          <div>
            <span className="inline-block w-20 pl-2">Status</span>
            <span className="inline-block pl-2">Customer Name</span>
          </div>
          <div>
            <span className="inline-block w-32 pl-1">Check In Time</span>
            <span className="inline-block w-24 pl-1">Time Called</span>
          </div>
        </div>
        <ul>{customers.map(getCustomerItems)}</ul>
      </div>
    </div>
  );
}

function getCustomerItems(c: Customer) {
  return (
    <li key={c.id} className="mb-1">
      <CustomerItem customer={c} onClick={fn} />
    </li>
  );
}

export default App;
