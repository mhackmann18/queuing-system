import { createContext } from 'react';
import { User } from 'utils/types';

interface AuthContextT {
  user: User;
  token: string;
  login: (userCredentials: { username: string; password: string }) => void;
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextT>({
  user: { id: '', username: '', firstName: '', lastName: '' },
  token: '',
  login: () => null,
  logOut: () => null
});
