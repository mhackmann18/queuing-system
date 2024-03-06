import { ReactElement, useEffect, useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import axios from 'axios';

export default function PrivateRoute({ children }: { children: ReactElement }) {
  const { token, user, logOut } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const interceptorRef = useRef<number>(0);

  // Log out if the user makes a request and gets a 401 (unauthorized) response from any api call
  useEffect(() => {
    interceptorRef.current = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logOut();
          navigate('/sign-in', {
            state: { error: 'Your session has expired. Please sign in again.' }
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorRef.current);
    };
  }, [navigate, logOut]);

  useEffect(() => {
    if (token && user) {
      setLoading(false);
    }
  }, [token, user]);

  if (!token) {
    return <Navigate to="/sign-in" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}
