import { useMemo } from 'react';
import FilterButton from 'components/CustomerManagerView/Header/StatusFilters/FilterButton';
import { StatusFilterButtonsProps } from './types';
import { sameDay } from 'utils/helpers';
import { StatusFilter } from 'utils/types';

export default function StatusFilterButtons({
  filters,
  setStatusFilters
}: StatusFilterButtonsProps) {
  const { statuses } = filters;

  const buttonsConfig = useMemo(() => {
    const toggleStatusFilter = (statusFilter: StatusFilter) =>
      setStatusFilters({ ...statuses, [statusFilter]: !statuses[statusFilter] });

    return [
      {
        name: 'Waiting',
        onClick: () => toggleStatusFilter('Waiting'),
        active: !!statuses.Waiting,
        disabled: !sameDay(filters.date, new Date())
      },
      {
        name: 'No Show',
        onClick: () => toggleStatusFilter('No Show'),
        active: !!filters.statuses['No Show']
      },
      {
        name: 'Served',
        onClick: () => toggleStatusFilter('Served'),
        active: !!statuses.Served
      },
      {
        name: 'Other Desks',
        onClick: () => toggleStatusFilter('Other Desks'),
        active: !!statuses['Other Desks'],
        disabled: !sameDay(filters.date, new Date())
      }
    ];
  }, [filters.date, filters.statuses, setStatusFilters, statuses]);

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
