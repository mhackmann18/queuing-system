import { ReactEventHandler } from 'react';
import { CustomerFilters, StatusFilters } from 'utils/types';

export interface StatusFilterButtonsProps {
  filters: CustomerFilters;
  setStatusFilters: (statuses: StatusFilters) => void;
}

export interface FilterButtonComponent {
  active?: boolean;
  onClick: ReactEventHandler;
  text: string;
  disabled?: boolean;
}
