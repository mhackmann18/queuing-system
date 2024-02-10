import { ManageCustomersHeaderProps } from './types';
// import DeskIcon from './DeskIcon';
import StatusFilters from './StatusFilters';
// import { FaChevronDown } from 'react-icons/fa';
// import { useContext, useRef, useState } from 'react';
// import { UserContext } from 'components/UserContextProvider/context';
// import DeskMenu from './DeskMenu';
import { Link } from 'react-router-dom';
// import { Division } from 'utils/types';
// import { getNextElement } from 'utils/helpers';
import { IoArrowBack } from 'react-icons/io5';

export default function ManageCustomersHeader({
  filters,
  filterSetters,
  setError
}: ManageCustomersHeaderProps) {
  // const user = useContext(UserContext);
  // const stationIconBtnRef = useRef<HTMLButtonElement>(null);
  // const [stationMenuActive, setStationMenuActive] = useState<boolean>(false);

  // const handleChangeDeptBtnClick = () => {
  //   // API.getOfficeDivisions returns
  //   const divisions = ['Motor Vehicle', 'Driver License'];

  //   filterSetters.setDivision(
  //     getNextElement<Division>(divisions, filters.division)!
  //   );
  // };

  return (
    <header className="h-28">
      {/* Header Row 1 */}
      <div className="border-b">
        <div className="relative mx-auto flex h-16 max-w-5xl justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <IoArrowBack />
            </Link>
            <h1 className="mr-4 inline-block w-80 items-center text-2xl font-bold">
              {filters.division} Customers
            </h1>
            {/* <button
              onClick={handleChangeDeptBtnClick}
              className="border-french_gray_1 hover:text-slate_gray mt-1 rounded-sm border"
            >
              <FaChevronDown size={14} />
            </button> */}
          </div>
          <div className="flex items-center">
            The current date and time goes here
          </div>
          {/* <div className="flex items-center">
            {user.division && ( // TODO: determine behavior of no station
              <DeskIcon
                onClick={() => setStationMenuActive(!stationMenuActive)}
                forwardRef={stationIconBtnRef}
                focused={stationMenuActive}
              />
            )}
          </div>
          {stationMenuActive && (
            <DeskMenu
              buttonRef={stationIconBtnRef}
              setError={setError}
              active={stationMenuActive}
              setActive={setStationMenuActive}
            />
          )} */}
        </div>
      </div>
      {/* Header Row 2 */}
      <div className="border-b shadow-sm">
        <div className="mx-auto flex max-w-5xl py-3">
          <StatusFilters
            filters={filters}
            setStatusFilters={filterSetters.setStatuses}
          />
          {/* <DateToggler
            date={filters.date}
            setDate={(newDate: Date) => filterSetters.setDate(newDate)}
            setError={setError}
          /> */}
        </div>
      </div>
    </header>
  );
}
