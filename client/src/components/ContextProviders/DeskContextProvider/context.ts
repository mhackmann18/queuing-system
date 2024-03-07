import { createContext } from 'react';

export interface Desk {
  divisionName: string;
  number: number;
}

interface DeskContextT {
  desk: Desk | null;
  sitAtDesk: (desk: Desk) => Promise<Desk>;
  leaveDesk: () => Promise<void>;
  originalSessionEndTime: Date | null;
}

export const DeskContext = createContext<DeskContextT>({
  desk: null,
  sitAtDesk: async () => {
    throw new Error('DeskContext is not provided.');
  },
  leaveDesk: async () => {
    throw new Error('DeskContext is not provided.');
  },
  originalSessionEndTime: null
});
