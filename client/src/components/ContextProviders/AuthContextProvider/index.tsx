import { ReactNode, useCallback, useEffect, useState } from 'react';
import { AuthContext } from './context';
import { useNavigate } from 'react-router-dom';
import { User } from 'utils/types';
import api from 'utils/api';
import axios from 'axios';

export interface AuthContextProviderProps {
  children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  // Exposed function to log out a user
  const logOut = useCallback(() => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    navigate('/sign-in');
  }, [navigate]);

  // useEffect(() => {
  //   // Check for token in local storage every 10 seconds
  //   const intervalId = setInterval(() => {
  //     const tokenExists = localStorage.getItem('token');

  //     if (!tokenExists) {
  //       logOut();
  //     }
  //   }, 10000);

  //   // Cleanup function to clear the interval when the component unmounts
  //   return () => clearInterval(intervalId);
  // }, [logOut]);

  // Attempt to get the user from the token if the token exists
  useEffect(() => {
    const getUserFromToken = async () => {
      try {
        const res = await api.getUserFromAuthToken(token);

        const data = res.data;

        const { username, id, firstName, lastName } = data;

        setUser({
          username,
          id,
          firstName,
          lastName
        });
      } catch (error) {
        // If the request was unauthorized, the token is invalid, so log out the user
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logOut();
        }
      }
    };

    // If there is a token and no user, attempt to get the user from the token
    if (token && !user) {
      getUserFromToken();
    }
  }, [token, user, logOut]);

  // Exposed function to login a user
  const login = async (userCredentials: { username: string; password: string }) => {
    const response = await api.loginUser(userCredentials);

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
