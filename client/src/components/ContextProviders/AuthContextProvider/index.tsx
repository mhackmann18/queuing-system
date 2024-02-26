import { ReactNode, useCallback, useState } from 'react';
import { AuthContext } from './context';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { User } from 'utils/types';

export interface AuthContextProviderProps {
  children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  const login = async (userCredentials: { username: string; password: string }) => {
    const response = await fetch('http://localhost:5274/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userCredentials)
    });

    const { data, error } = await response.json();

    if (data) {
      const { username, id, firstName, lastName } = data;

      setUser({
        username,
        id,
        firstName,
        lastName
      });

      setToken(username);
      localStorage.setItem('username', username);
      navigate('/dashboard');
    } else {
      console.error(error);
    }
  };

  const logOut = useCallback(() => {
    setUser(null);
    setToken('');
    localStorage.removeItem('username');
    navigate('/sign-in');
  }, [navigate]);

  useBeforeUnload(logOut);

  return (
    <AuthContext.Provider value={{ user, token, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
