import FilterButton from 'components/Header/StatusFilters/FilterButton';
import { StatusFiltersProps } from './types';
import { CustomerStatus, Station } from 'utils/types';

const signedInStation: Station = 'MV1';
const department = signedInStation[0] === 'M' ? 'Motor Vehicle' : "Driver's License";

export default function StatusFilters({
  statusFilters,
  setStatusFilters
}: StatusFiltersProps) {
  const buttonStatusNames: CustomerStatus[] = ['Waiting', 'No Show', 'Served'];
  const otherStationsBtnActive =
    department === 'Motor Vehicle'
      ? statusFilters.MV1 ||
        statusFilters.MV2 ||
        statusFilters.MV3 ||
        statusFilters.MV4
      : statusFilters.DL1 || statusFilters.DL2;

  const handleOtherStationsBtnClick = () => {
    if (department === 'Motor Vehicle') {
      setStatusFilters({
        ...statusFilters,
        MV1: !statusFilters.MV1,
        MV2: !statusFilters.MV2,
        MV3: !statusFilters.MV3,
        MV4: !statusFilters.MV4
      });
    } else {
      setStatusFilters({
        ...statusFilters,
        DL1: !statusFilters.DL1,
        DL2: !statusFilters.DL2
      });
    }
  };

  return (
    <div>
      <ul className="inline-block">
        {buttonStatusNames.map((status) => (
          <li key={status} className="mr-2 inline-block">
            <FilterButton
              text={status}
              onClick={() =>
                setStatusFilters({
                  ...statusFilters,
                  [status]: !statusFilters[status]
                })
              }
              active={statusFilters[status]}
            />
          </li>
        ))}
        <li className="mr-2 inline-block">
          <button
            onClick={handleOtherStationsBtnClick}
            type="button"
            className={`rounded-full border px-3 py-1 font-medium ${
              otherStationsBtnActive
                ? `bg-french_gray_2-400 border-french_gray_2-400 hover:bg-french_gray_2-300 
          hover:border-french_gray_2-300 text-white`
                : 'text-slate_gray border-french_gray_1-500 hover:bg-platinum-800 hover:border-slate_gray'
            }`}
          >
            Other Stations
          </button>
        </li>
      </ul>
    </div>
  );
}
