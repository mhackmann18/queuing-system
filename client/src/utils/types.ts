export type Office = string;

export type Division = string;

export type ManageCustomerAction =
  | 'Finish Serving'
  | 'Mark No Show'
  | 'Call to Station'
  | 'Delete'
  | 'Return to Waiting List';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export type DBCustomerStatus = 'Waiting' | 'Served' | 'No Show' | `Desk ${number}`;

export type CustomerStatusBase = 'Waiting' | 'Serving' | 'Served' | 'No Show';

export type CustomerStatus = CustomerStatusBase | `Desk ${number}`;

export type StatusFilter = CustomerStatusBase | 'Other Desks';

export interface CustomerFilters {
  date: Date;
  statuses: StatusFilters;
  division: Division;
}

export interface Customer {
  id: string; // TODO: uuid
  status: CustomerStatus;
  name: string; // TODO: first and last name
  checkInTime: Date;
  timesCalled: Date[];
  reasonsForVisit: Division[];
  atOtherDivision?: Division;
  waitingListIndex?: number;
}

export interface CustomerDto {
  id: string;
  fullName: string;
  checkInTime: string;
  divisions: {
    name: string;
    status: CustomerStatus;
    waitingListIndex?: number;
    timesCalled: string[];
  }[];
}

export type StatusFilters = Partial<Record<StatusFilter, boolean>>;

// https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

interface WlPosPickerVals {
  index: number;
  locked: boolean;
}

export type WaitingListPositionPickerState = WlPosPickerVals | null;
