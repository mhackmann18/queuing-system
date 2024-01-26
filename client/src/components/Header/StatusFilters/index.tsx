import { useMemo } from 'react';
import FilterButton from 'components/Header/StatusFilters/FilterButton';
import { StatusFilterButtonsProps } from './types';
import { sameDay } from 'utils/helpers';
import { CustomerStatus } from 'utils/types';

// const signedInStation = 'MV1';
// const signedInDept =
//   signedInStation[0] === 'M' ? 'Motor Vehicle' : "Driver's License";

export default function StatusFilterButtons({
  filters,
  setStatuses
}: StatusFilterButtonsProps) {
  const buttonsConfig = useMemo(() => {
    let config;
    const { Waiting, Served, MV1, MV2, MV3, MV4, DL1, DL2 } = filters.statuses;
    const toggleStatus = (status: CustomerStatus) =>
      setStatuses({ ...filters.statuses, [status]: !filters.statuses[status] });
    const handleOtherStationsClick = () => {
      if (filters.department === 'Motor Vehicle') {
        setStatuses({
          ...filters.statuses,
          MV1: !MV1,
          MV2: !MV2,
          MV3: !MV3,
          MV4: !MV4
        });
      } else {
        setStatuses({ ...filters.statuses, DL1: !DL1, DL2: !DL2 });
      }
    };
    const otherStationsBtnActive = MV1 || MV2 || MV3 || MV4 || DL1 || DL2 || false;

    if (!sameDay(filters.date, new Date())) {
      config = [
        {
          name: 'Waiting',
          onClick: () => toggleStatus('Waiting'),
          active: !!Waiting
        },
        {
          name: 'No Show',
          onClick: () => toggleStatus('No Show'),
          active: !!filters.statuses['No Show']
        }
      ];
    } else {
      config = [
        {
          name: 'Waiting',
          onClick: () => toggleStatus('Waiting'),
          active: !!Waiting
        },
        {
          name: 'No Show',
          onClick: () => toggleStatus('No Show'),
          active: !!filters.statuses['No Show']
        },
        {
          name: 'Served',
          onClick: () => toggleStatus('Served'),
          active: !!Served
        },
        {
          name: 'Other Stations',
          onClick: handleOtherStationsClick,
          active: otherStationsBtnActive
        }
      ];
    }

    return config;
  }, [filters, setStatuses]);

  return (
    <div>
      <ul className="inline-block">
        {buttonsConfig.map(({ name, onClick, active }) => (
          <li key={name} className="mr-2 inline-block">
            <FilterButton text={name} onClick={onClick} active={active} />
          </li>
        ))}
      </ul>
    </div>
  );
}
