import { DLStation, MVStation, RequireAtLeastOne } from 'utils/types';

type CRawStatus = 'Waiting' | 'Served' | 'No Show';

export type DLCustomerRawStatus = DLStation | CRawStatus;
export type MVCustomerRawStatus = MVStation | CRawStatus;

export type CustomerRawStatus = DLCustomerRawStatus | MVCustomerRawStatus;

interface CRaw {
  id: number;
  firstName: string;
  lastName: string;
  checkInTime: string;
  motorVehicle?: {
    status: MVCustomerRawStatus;
    callTimes: string[] | [];
  };
  driversLicense?: {
    status: DLCustomerRawStatus;
    callTimes: string[] | [];
  };
}

export type CustomerRaw = RequireAtLeastOne<
  CRaw,
  'motorVehicle' | 'driversLicense'
>;
