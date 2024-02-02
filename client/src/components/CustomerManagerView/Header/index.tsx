import { ManageCustomersHeaderProps } from './types';
import StationIcon from './DeskIcon';
import StatusFilters from './StatusFilters';
import DateToggler from './DateToggler';
import { FaChevronDown } from 'react-icons/fa';
import { useContext, useRef, useState } from 'react';
import { UserContext } from 'components/UserContextProvider/context';
import StationMenu from './StationMenu';
import { Division } from 'utils/types';
import { getNextElement } from 'utils/helpers';

export default function ManageCustomersHeader({
  filters,
  filterSetters,
  setError
}: ManageCustomersHeaderProps) {
  const user = useContext(UserContext);
  const stationIconBtnRef = useRef<HTMLButtonElement>(null);
  const [stationMenuActive, setStationMenuActive] = useState<boolean>(false);

  const handleChangeDeptBtnClick = () => {
    // API.getOfficeDivisions returns
    const divisions = ['Motor Vehicle', 'Driver License'];

    filterSetters.setDivision(
      getNextElement<Division>(divisions, filters.division)!
    );
  };

  return (
    <header className="h-28">
      {/* Header Row 1 */}
      <div className="border-b">
        <div className="relative mx-auto flex h-16 max-w-5xl justify-between">
          <div className="flex items-center">
            <h1 className="mr-4 inline-block w-80 items-center text-2xl font-bold">
              {filters.division} Customers
            </h1>
            <button
              onClick={handleChangeDeptBtnClick}
              className="border-french_gray_1 hover:text-slate_gray mt-1 rounded-sm border"
            >
              <FaChevronDown size={14} />
            </button>
          </div>
          <div className="flex items-center">
            {user.division && ( // TODO: determine behavior of no station
              <StationIcon
                onClick={() => setStationMenuActive(!stationMenuActive)}
                forwardRef={stationIconBtnRef}
                focused={stationMenuActive}
              />
            )}
          </div>
          {stationMenuActive && (
            <StationMenu
              buttonRef={stationIconBtnRef}
              setError={setError}
              active={stationMenuActive}
              setActive={setStationMenuActive}
            />
          )}
        </div>
      </div>
      {/* Header Row 2 */}
      <div className="border-b shadow-sm">
        <div className="mx-auto flex max-w-5xl justify-between py-3">
          <StatusFilters
            filters={filters}
            setStatusFilters={filterSetters.setStatuses}
          />
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
