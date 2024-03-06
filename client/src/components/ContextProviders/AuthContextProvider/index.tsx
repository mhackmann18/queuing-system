import { ReactNode, useCallback, useEffect, useState } from 'react';
import { AuthContext } from './context';
import { useNavigate } from 'react-router-dom';
import { User } from 'utils/types';
import api from 'utils/api';

export interface AuthContextProviderProps {
  children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in local storage every 10 seconds
    const intervalId = setInterval(() => {
      const tokenExists = localStorage.getItem('token');

      if (!tokenExists) {
        setToken('');
      }
    }, 10000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const logOut = useCallback(() => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    navigate('/sign-in');
  }, [navigate]);

  useEffect(() => {
    const getUserFromToken = async () => {
      try {
        const res = await api.getUserFromAuthToken(token);

        if (res.status === 401) {
          logOut();
          return;
        }

        const data = res.data;

        const { username, id, firstName, lastName } = data;

        setUser({
          username,
          id,
          firstName,
          lastName
        });
      } catch (error) {
        logOut();
      }
    };

    if (token && !user) {
      getUserFromToken();
    }
  }, [token, user, logOut]);

  const login = async (userCredentials: { username: string; password: string }) => {
    const response = await api.loginUser(userCredentials);

    if (response.status !== 200) {
      console.error('Error logging in');
      return;
    }

    const { username, id, firstName, lastName, token } = response.data;

    setUser({
      username,
      id,
      firstName,
      lastName
    });

    setToken(token);
    localStorage.setItem('token', token);
    navigate('/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
