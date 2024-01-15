/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactElement } from 'react';

export type Station = 'MV1' | 'MV2' | 'MV3' | 'MV4' | 'DL1' | 'DL2';

export interface CustomerAction {
  title: string;
  ConfirmationComponent?: ({
    onCancel,
    onConfirm
  }: {
    onCancel: any;
    onConfirm: any;
  }) => ReactElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: any;
}

export type CustomerStatus =
  | 'Waiting'
  | 'Serving'
  | 'Served'
  | 'No Show'
  | `At ${Station}`;

export type Filter = 'Waiting' | 'Served' | 'No Show';

export interface Customer {
  id: number;
  status: CustomerStatus;
  name: string;
  checkInTime: Date;
  callTimes: Date[];
  reasonsForVisit: string[];
}
