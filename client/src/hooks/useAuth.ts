import { useContext } from 'react';
import { AuthContext } from 'components/ContextProviders/AuthContextProvider/context';

export default function useAuth() {
  return useContext(AuthContext);
}
