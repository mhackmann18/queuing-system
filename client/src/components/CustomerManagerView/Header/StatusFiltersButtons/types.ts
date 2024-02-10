import { ReactEventHandler } from 'react';
import { CustomerFilters, StatusFilters } from 'utils/types';

export interface StatusFiltersButtonsProps {
  filters: CustomerFilters;
  setStatusFilters: (statuses: StatusFilters) => void;
  containerStyles?: string;
}

export interface FilterButtonComponent {
  active?: boolean;
  onClick: ReactEventHandler;
  text: string;
  disabled?: boolean;
}
