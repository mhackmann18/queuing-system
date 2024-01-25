import { ManageCustomersHeaderProps } from './types';
import StationIcon from './StationIcon';
import StatusFilters from './StatusFilters';
import DateToggler from './DateToggler';

export default function ManageCustomersHeader({
  signedInStation,
  filters,
  filterSetters
}: ManageCustomersHeaderProps) {
  return (
    <header className="h-28">
      {/* Header Row 1 */}
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl justify-between">
          <h1 className="mr-4 flex items-center text-2xl font-bold">
            {filters.department} Customers
          </h1>
          <div className="flex items-center">
            {signedInStation !== 'none' && ( // TODO: determine behavior on 'none'
              <StationIcon
                onClick={() => {
                  console.log('station icon clicked');
                }}
                station={signedInStation}
              />
            )}
          </div>
        </div>
      </div>
      {/* Header Row 2 */}
      <div className="border-b shadow-sm">
        <div className="mx-auto flex max-w-5xl justify-between py-3">
          <StatusFilters
            statusFilters={filters.statuses}
            setStatusFilters={filterSetters.setStatuses}
          />
          <DateToggler
            date={filters.date}
            setDate={(newDate: Date) => filterSetters.setDate(newDate)}
          />
        </div>
      </div>
    </header>
  );
}
