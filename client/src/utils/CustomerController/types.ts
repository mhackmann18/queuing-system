import { Customer, Division } from 'utils/types';

export type CustomerRawStatus = 'Waiting' | 'Served' | 'No Show' | `Desk ${number}`;

interface CustomerRawDivisionData {
  status: CustomerRawStatus;
  callTimes: string[];
}

export interface CustomerRaw {
  id: number;
  firstName: string;
  lastName: string;
  checkInTime: string;
  divisions: Record<Division, CustomerRawDivisionData>;
}

// There should only be an error when the data is null.
// Similarly, the data should only be null when there's an error.
export interface CustomerControllerSingleResult {
  data: Customer | null;
  error?: string;
}

// There should only be an error when the data is null.
// Similarly, the data should only be null when there's an error.
export interface CustomerControllerManyResult {
  data: Customer[] | null;
  error?: string;
}
