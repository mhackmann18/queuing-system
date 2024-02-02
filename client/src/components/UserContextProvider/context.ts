import { createContext } from 'react';
import { User } from 'utils/types';

export const UserContext = createContext<User>({
  id: -1,
  division: 'Made Up Division',
  deskNum: -1
});
