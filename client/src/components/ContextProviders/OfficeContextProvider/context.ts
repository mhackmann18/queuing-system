import { createContext } from 'react';

export interface OfficeContextT {
  id: string;
  name: string;
  divisionNames: string[]; // TODO: This could be null
}

export const OfficeContext = createContext<OfficeContextT | null>(null);
