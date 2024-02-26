import { ReactNode, useCallback, useEffect, useState } from 'react';
import { AuthContext } from './context';
import { useNavigate } from 'react-router-dom';
import { User } from 'utils/types';

export interface AuthContextProviderProps {
  children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const getUserFromToken = async () => {
      const res = await fetch('http://localhost:5274/api/v1/users/self', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { data, error } = await res.json();

      if (data) {
        const { username, id, firstName, lastName } = data;

        setUser({
          username,
          id,
          firstName,
          lastName
        });
      } else {
        console.error(error);
      }
    };

    if (token && !user) {
      getUserFromToken();
    }
  }, [token, user]);

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
      const { username, id, firstName, lastName, token } = data;

      setUser({
        username,
        id,
        firstName,
        lastName
      });

      setToken(token);
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      console.error(error);
    }
  };

  const logOut = useCallback(() => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    navigate('/sign-in');
  }, [navigate]);

  // useBeforeUnload(logOut);

  return (
    <AuthContext.Provider value={{ user, token, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
