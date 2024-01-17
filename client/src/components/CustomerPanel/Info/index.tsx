import { Customer } from 'utils/types';
import { get12HourTimeString } from 'utils/helpers';

export default function CustomerPanelInfo({
  customer: { checkInTime, callTimes, reasonsForVisit }
}: {
  customer: Customer;
}) {
  return (
    <div>
      <h4 className="text-french_gray_1-500 mt-2 text-sm font-medium">
        Check In Time
      </h4>
      <p className="">{get12HourTimeString(checkInTime)}</p>

      <h4 className="text-french_gray_1-500 mt-2 text-sm font-medium">
        Times Called
      </h4>
      <ul>
        {callTimes.length ? (
          callTimes.map((c) => (
            <li className="" key={c.toUTCString()}>
              {get12HourTimeString(c)}
            </li>
          ))
        ) : (
          <li className="text-french_gray_1-500 text-sm font-medium">--</li>
        )}
      </ul>

      <h4 className="text-french_gray_1-500 mt-2 text-sm font-medium">
        Reasons for Visit
      </h4>
      <p className="">{reasonsForVisit ? reasonsForVisit?.join(', ') : '--'}</p>
    </div>
  );
}
