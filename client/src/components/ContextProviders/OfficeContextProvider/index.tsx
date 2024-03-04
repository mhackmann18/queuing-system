import useAuth from 'hooks/useAuth';
import { useState, ReactElement, useEffect } from 'react';
import { OfficeContext, OfficeContextT } from './context';
import api from 'utils/api';
import { DUMMY_OFFICE_ID } from 'utils/constants';

interface OfficeContextProviderProps {
  children: ReactElement;
}

export default function OfficeContextProvider({
  children
}: OfficeContextProviderProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [office, setOffice] = useState<OfficeContextT | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const getOffice = async () => {
      try {
        setLoading(true);
        const response = await api.getOffice(DUMMY_OFFICE_ID, token);

        if (!response.ok) {
          throw new Error('Failed to fetch office');
        }

        const office = await response.json();

        setOffice({
          id: office.id,
          name: office.name,
          divisionNames: office.divisionNames
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getOffice();
    }
  }, [token]);

  if (loading) {
    return null;
  }

  return <OfficeContext.Provider value={office}>{children}</OfficeContext.Provider>;
}
