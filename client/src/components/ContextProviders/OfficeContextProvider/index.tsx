import useAuth from 'hooks/useAuth';
import { useState, ReactElement, useEffect } from 'react';
import { useFetchOffice } from 'hooks/apiHooks';
import { OfficeContext, OfficeContextT } from './context';

interface OfficeContextProviderProps {
  children: ReactElement;
}

export default function OfficeContextProvider({
  children
}: OfficeContextProviderProps) {
  const [office, setOffice] = useState<OfficeContextT | null>(null);
  const { token } = useAuth();
  const { loading, fetchOffice } = useFetchOffice();

  useEffect(() => {
    const getOffice = async () => {
      const { error, data } = await fetchOffice();

      if (error) {
        console.error(error);
      } else if (data) {
        setOffice({
          id: data.id,
          name: data.name,
          divisionNames: data.divisionNames
        });
      }
    };

    if (token) {
      getOffice();
    }
  }, [fetchOffice, token]);

  if (loading) {
    return <div>Loading office...</div>;
  }

  return <OfficeContext.Provider value={office}>{children}</OfficeContext.Provider>;
}
