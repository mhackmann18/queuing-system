import { ManageCustomersHeaderProps } from './types';
import StationIcon from './StationIcon';
import StatusFilters from './StatusFilters';
import DateToggler from './DateToggler';
import { FaChevronDown } from 'react-icons/fa';
import { useContext } from 'react';
import UserContext from 'components/UserContext';
import StationMenu from './StationMenu';

export default function ManageCustomersHeader({
  filters,
  filterSetters,
  setError,
  stationMenuActive
}: ManageCustomersHeaderProps) {
  const user = useContext(UserContext);

  const handleChangeDeptBtnClick = () => {
    filterSetters.setDepartment(
      filters.department === 'Motor Vehicle' ? "Driver's License" : 'Motor Vehicle'
    );
  };

  return (
    <header className="h-28">
      {/* Header Row 1 */}
      <div className="border-b">
        <div className="relative mx-auto flex h-16 max-w-5xl justify-between">
          <div className="flex items-center">
            <h1 className="mr-4 inline-block w-80 items-center text-2xl font-bold">
              {filters.department} Customers
            </h1>
            <button
              onClick={handleChangeDeptBtnClick}
              className="border-french_gray_1 mt-1 rounded-sm border"
            >
              <FaChevronDown size={14} />
            </button>
          </div>
          <div className="flex items-center">
            {user!.station !== 'none' && ( // TODO: determine behavior on 'none'
              <StationIcon
                onClick={() => {
                  stationMenuActive.setValue(!stationMenuActive.value);
                }}
                station={user!.station}
              />
            )}
          </div>
          {stationMenuActive.value && <StationMenu setError={setError} />}
        </div>
      </div>
      {/* Header Row 2 */}
      <div className="border-b shadow-sm">
        <div className="mx-auto flex max-w-5xl justify-between py-3">
          <StatusFilters filters={filters} setStatuses={filterSetters.setStatuses} />
          <DateToggler
            date={filters.date}
            setDate={(newDate: Date) => filterSetters.setDate(newDate)}
            setError={setError}
          />
        </div>
      </div>
    </header>
  );
}
