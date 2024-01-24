import FilterButton from 'components/Header/StatusFilters/FilterButton';
import { Filter } from 'utils/types';
import { StatusFiltersProps } from './types';

export default function Filters({
  statusFilters,
  toggleFilter
}: StatusFiltersProps) {
  return (
    <div>
      <span className="mr-2 inline-block border-r pr-2 font-semibold">
        Filters
      </span>
      <ul className="inline-block">
        {Object.keys(statusFilters).map((filter) => (
          <li key={filter} className="mr-2 inline-block">
            <FilterButton
              text={filter}
              onClick={() => toggleFilter(filter as Filter)}
              active={statusFilters[filter as Filter]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
