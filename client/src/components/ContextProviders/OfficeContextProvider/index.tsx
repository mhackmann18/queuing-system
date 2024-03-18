import { useState, ReactElement, useEffect } from 'react';
import { OfficeContext, OfficeContextT } from './context';
import api from 'utils/api';
import { DUMMY_OFFICE_ID } from 'utils/constants';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from 'utils/initFirebase';

interface OfficeContextProviderProps {
  children: ReactElement;
}

export default function OfficeContextProvider({
  children
}: OfficeContextProviderProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [office, setOffice] = useState<OfficeContextT | null>(null);
  const [user, setUser] = useState(getAuth(app).currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getOffice = async () => {
      try {
        setLoading(true);
        const token = await user!.getIdToken();
        console.log(token);
        const response = await api.getOffice(DUMMY_OFFICE_ID, token);

        if (response.status !== 200) {
          throw new Error('Failed to fetch office');
        }

        const office = response.data;

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

    if (user) {
      getOffice();
    }
  }, [user]);

  if (loading) {
    return null;
  }

  return <OfficeContext.Provider value={office}>{children}</OfficeContext.Provider>;
}
