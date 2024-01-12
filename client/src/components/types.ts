export type Station = 'MV1' | 'MV2' | 'MV3' | 'MV4' | 'DL1' | 'DL2';

export interface CustomerAction {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: any;
}

export type CustomerStatus =
  | 'Waiting'
  | 'Serving'
  | 'Served'
  | 'No Show'
  | 'At MV1'
  | 'At MV2'
  | 'At MV3'
  | 'At MV4'
  | 'At DL1'
  | 'At DL2';

export interface Customer {
  id: number;
  status: CustomerStatus;
  name: string;
  checkInTime: Date;
  callTimes: Date[];
  reasonsForVisit?: string[];
}
