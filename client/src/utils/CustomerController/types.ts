import { DLStation, MVStation, RequireAtLeastOne } from 'utils/types';

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

export type CustomerRaw = RequireAtLeastOne<
  CRaw,
  'motorVehicle' | 'driversLicense'
>;
