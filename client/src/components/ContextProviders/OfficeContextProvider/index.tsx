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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOffice = async () => {
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}`,
        {
          method: 'GET'
        }
      );

      const { error, data } = await res.json();

      if (error) {
        setError(error);
      } else if (data) {
        setOffice({
          id: data.id,
          name: data.name,
          divisionNames: data.divisionNames
        });
      }

      setLoading(false);
    };

    fetchOffice();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return office ? (
    <OfficeContext.Provider value={office}>{children}</OfficeContext.Provider>
  ) : (
    error
  );
}
