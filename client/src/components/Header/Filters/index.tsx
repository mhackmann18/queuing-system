import FilterButton from 'components/Header/Filters/FilterButton';
import { Filter } from 'components/types';

interface FiltersComponentProps {
  activeFilters: Record<Filter, boolean>;
  toggleFilter: (filter: Filter) => void;
}

export default function Filters({
  activeFilters,
  toggleFilter
}: FiltersComponentProps) {
  return (
    <div>
      <span className="mr-2 inline-block border-r pr-2 font-semibold">
        Filters
      </span>
      <ul className="inline-block">
        {Object.keys(activeFilters).map((filter) => (
          <li key={filter} className="mr-2 inline-block">
            <FilterButton
              text={filter}
              onClick={() => toggleFilter(filter as Filter)}
              active={activeFilters[filter as Filter]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
