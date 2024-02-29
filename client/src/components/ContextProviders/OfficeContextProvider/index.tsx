import useAuth from 'hooks/useAuth';
import { createContext, useState, ReactElement, useEffect } from 'react';
import { DUMMY_OFFICE_ID } from 'utils/constants';

interface OfficeContextT {
  id: string;
  name: string;
  divisionNames: string[]; // TODO: This could be null
}

export const OfficeContext = createContext<OfficeContextT>({
  id: '',
  name: '',
  divisionNames: []
});

interface OfficeContextProviderProps {
  children: ReactElement;
}

export default function OfficeContextProvider({
  children
}: OfficeContextProviderProps) {
  const [office, setOffice] = useState<OfficeContextT | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string>('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchOffice = async () => {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { error, data } = await res.json();

      if (error) {
        console.error(error);
      } else if (data) {
        setOffice({
          id: data.id,
          name: data.name,
          divisionNames: data.divisionNames
        });
      }

      setLoading(false);
    };

    if (token) {
      try {
        fetchOffice();
      } catch (error) {
        console.error('Error fetching office');
      } finally {
        setLoading(false);
      }
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <OfficeContext.Provider value={office!}>{children}</OfficeContext.Provider>;
}
