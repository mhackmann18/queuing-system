import { createContext } from 'react';
import { User } from 'utils/types';

export const UserContext = createContext<User>({
  id: '',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe'
});
