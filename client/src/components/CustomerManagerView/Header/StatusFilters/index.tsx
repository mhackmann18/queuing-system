import { useEffect, useMemo } from 'react';
import FilterButton from 'components/CustomerManagerView/Header/StatusFilters/FilterButton';
import { StatusFilterButtonsProps } from './types';
import { sameDay } from 'utils/helpers';
import { CustomerStatus } from 'utils/types';

export default function StatusFilterButtons({
  filters,
  setStatuses
}: StatusFilterButtonsProps) {
  const {
    statuses: { Waiting, Served, MV1, MV2, MV3, MV4, DL1, DL2 },
    department
  } = filters;

  // Keep the status filters in sync with the current dept
  useEffect(() => {
    if (MV1 && department !== 'Motor Vehicle') {
      setStatuses({
        ...filters.statuses,
        MV1: !MV1,
        MV2: !MV2,
        MV3: !MV3,
        MV4: !MV4,
        DL1: true,
        DL2: true
      });
    } else if (DL1 && department !== "Driver's License") {
      setStatuses({
        ...filters.statuses,
        MV1: true,
        MV2: true,
        MV3: true,
        MV4: true,
        DL1: !DL1,
        DL2: !DL2
      });
    }
  }, [DL1, DL2, MV1, MV2, MV3, MV4, department, filters.statuses, setStatuses]);

  const buttonsConfig = useMemo(() => {
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

    return [
      {
        name: 'Waiting',
        onClick: () => toggleStatus('Waiting'),
        active: !!Waiting,
        disabled: !sameDay(filters.date, new Date())
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
        active: otherStationsBtnActive,
        disabled: !sameDay(filters.date, new Date())
      }
    ];
  }, [
    DL1,
    DL2,
    MV1,
    MV2,
    MV3,
    MV4,
    Served,
    Waiting,
    filters.date,
    filters.department,
    filters.statuses,
    setStatuses
  ]);

  return (
    <div>
      <ul className="inline-block">
        {buttonsConfig.map(({ name, onClick, active, disabled }) => (
          <li key={name} className="mr-2 inline-block">
            <FilterButton
              text={name}
              onClick={onClick}
              active={active}
              disabled={!!disabled}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
