import { createContext } from 'react';
import { User } from 'utils/types';

interface AuthContextT {
  user: User | null;
  token: string;
  login: (userCredentials: { username: string; password: string }) => Promise<void>;
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextT>({
  user: null,
  token: '',
  login: async () => {},
  logOut: () => null
});
