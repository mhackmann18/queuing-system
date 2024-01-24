import FilterButton from 'components/Header/StatusFilters/FilterButton';
import { StatusFiltersProps } from './types';
import { CustomerStatus } from 'utils/types';

export default function StatusFilters({
  statusFilters,
  toggleFilter
}: StatusFiltersProps) {
  const buttonStatusNames: CustomerStatus[] = ['Waiting', 'No Show', 'Served'];

  return (
    <div>
      <ul className="inline-block">
        {buttonStatusNames.map((status) => (
          <li key={status} className="mr-2 inline-block">
            <FilterButton
              text={status}
              onClick={() => toggleFilter(status)}
              active={statusFilters[status]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
