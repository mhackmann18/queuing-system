export type MVStation = 'MV1' | 'MV2' | 'MV3' | 'MV4';

export type DLStation = 'DL1' | 'DL2';

export type Station = MVStation | DLStation;

export type Department = 'Motor Vehicle' | "Driver's License";

export type CustomerStatus =
  | 'Waiting'
  | 'Serving'
  | 'Served'
  | 'No Show'
  | `${Station}`;

export type Filter = 'Waiting' | 'Served' | 'No Show';

export interface Customer {
  id: number; // This should be a string?
  status: CustomerStatus;
  name: string;
  checkInTime: Date;
  callTimes: Date[];
  reasonsForVisit: string[];
}

// https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
