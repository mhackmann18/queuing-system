import { Station } from 'utils/types';

export interface User {
  id: number;
  station: Station | 'none';
}
