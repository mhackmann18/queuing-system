import { ReactElement, useEffect, useState, createContext } from 'react';
import useAuth from 'hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DUMMY_OFFICE_ID } from 'utils/constants';

const DUMMY_DIVISION_NAME = 'Motor Vehicle';
const deskNum = 1;

interface DeskContextT {
  divisionName: string;
  deskNum: number;
}

export const DeskContext = createContext<DeskContextT | null>(null);

export default function DeskRequired({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [desk, setDesk] = useState<DeskContextT | null>(null);

  useEffect(() => {
    const getUpFromDesk = async () => {
      // Get user up from desk
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}/users/${user.userId}/desk`,
        {
          method: 'DELETE'
        }
      );

      const { error, data } = await res.json();

      if (error) {
        console.error(error);
      } else if (data) {
        console.log(data);
      }
    };

    return () => {
      console.log('cleanup');
      (async () => {
        await getUpFromDesk();
      })();
    };
  }, [user.userId]);

  useEffect(() => {
    const sitAtDesk = async () => {
      // Sit user at desk
      console.log(user);
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${DUMMY_OFFICE_ID}/users/${user.userId}/desk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            divisionName: DUMMY_DIVISION_NAME,
            deskNumber: deskNum
          })
        }
      );

      const { error, data } = await res.json();

      console.log(data);

      if (error) {
        console.error(error);
      } else if (data) {
        console.log(data);
        setDesk({ divisionName: data.divisionName, deskNum: data.deskNumber });
        setLoading(false);
      }
    };

    sitAtDesk();
  }, [user]);

  console.log(loading);
  console.log(desk);

  if (loading) {
    return null;
  }

  return desk ? (
    <DeskContext.Provider value={desk}>{children}</DeskContext.Provider>
  ) : (
    <Navigate to="/dashboard/customer-manager" />
  );
}
