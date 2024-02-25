import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export default function PrivateRoute({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/sign-in" />;
  }
  return children;
}
