import CustomerItem from './CustomerItem';

function App() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="m-4 w-1/2">
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
        <ul>
          <li className="mb-1">
            <CustomerItem
              status="Serving"
              name="John Doe"
              checkInTime={new Date()}
              callTime={new Date()}
              onClick={() => console.log('dsf')}
            />
          </li>
          <li className="mb-1">
            <CustomerItem
              status="Served"
              name="John Doe"
              checkInTime={new Date()}
              callTime={new Date()}
              onClick={() => console.log('dsf')}
            />
          </li>
          <li className="mb-1">
            <CustomerItem
              status="Waiting"
              name="John Doe"
              checkInTime={new Date()}
              callTime={new Date()}
              onClick={() => console.log('dsf')}
            />
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
