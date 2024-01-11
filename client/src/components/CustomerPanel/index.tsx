import { Customer } from 'components/types';
import { get12HourTimeString } from 'utils/helpers';

interface CustomerPanelProps {
  customer: Customer;
}

export default function CustomerPanel({
  customer: { name, callTimes, checkInTime, reasonsForVisit }
}: CustomerPanelProps) {
  return (
    <div className="rounded-lg border px-8 py-4 text-lg">
      <h2 className="mb-4 text-2xl font-bold">{name}</h2>
      <h3 className="mt-2 font-medium">Manage Customer</h3>
      <div>
        <button>Finish Serving</button>
      </div>
      <h4 className="mt-2 font-medium">Check In Time</h4>
      <p className="text-french_gray_1-400">
        {get12HourTimeString(checkInTime)}
      </p>
      <h4 className="mt-2 font-medium">Reasons for Visit</h4>
      <p className="text-french_gray_1-400">
        {reasonsForVisit ? reasonsForVisit?.join(', ') : '--'}
      </p>
      <h4 className="mt-2 font-medium">Times Called</h4>
      <p className="text-french_gray_1-400">
        {callTimes ? callTimes.map(get12HourTimeString).join(', ') : '--'}
      </p>
    </div>
  );
}
