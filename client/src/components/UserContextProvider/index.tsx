import { useState } from 'react';
import { User } from 'utils/types';
import { UserContextProviderProps } from './types';
import { UserContext } from './context';

export default function UserContextProvider({ children }: UserContextProviderProps) {
  const [user] = useState<User>({ id: 1, division: 'Motor Vehicle', deskNum: 1 });

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
