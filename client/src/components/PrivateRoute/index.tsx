import { ReactElement, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export default function PrivateRoute({ children }: { children: ReactElement }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

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
