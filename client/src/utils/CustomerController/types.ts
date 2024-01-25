import { DLStation, MVStation, RequireAtLeastOne, Customer } from 'utils/types';

export type CustomerRawGenericStatus = 'Waiting' | 'Served' | 'No Show';

export type DLCustomerRawStatus = DLStation | CustomerRawGenericStatus;
export type MVCustomerRawStatus = MVStation | CustomerRawGenericStatus;

export type CustomerRawStatus = DLCustomerRawStatus | MVCustomerRawStatus;

interface CRaw {
  id: number;
  firstName: string;
  lastName: string;
  checkInTime: string;
  motorVehicle?: {
    status: MVCustomerRawStatus;
    callTimes: string[];
  };
  driversLicense?: {
    status: DLCustomerRawStatus;
    callTimes: string[];
  };
}

export type CustomerRaw = RequireAtLeastOne<CRaw, 'motorVehicle' | 'driversLicense'>;

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
