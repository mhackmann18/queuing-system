import { Customer } from 'utils/types';
import { get12HourTimeString, sortDatesDescending } from 'utils/helpers';

export default function CustomerPanelInfo({
  customer: { checkInTime, timesCalled, reasonsForVisit }
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
        Time{timesCalled.length > 1 ? 's' : ''} Called
      </h4>
      <ul>
        {timesCalled.length ? (
          sortDatesDescending(timesCalled).map((t) => (
            <li key={t.toUTCString()}>{get12HourTimeString(t)}</li>
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
