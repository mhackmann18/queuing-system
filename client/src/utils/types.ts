export type Station = 'MV1' | 'MV2' | 'MV3' | 'MV4' | 'DL1' | 'DL2';

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
