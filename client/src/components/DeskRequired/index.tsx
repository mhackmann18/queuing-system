import { ReactElement, useEffect, useState, createContext } from 'react';
import useAuth from 'hooks/useAuth';
import { Navigate, useParams } from 'react-router-dom';
import useOffice from 'hooks/useOffice';

interface DeskContextT {
  divisionName: string;
  deskNum: number;
}

export const DeskContext = createContext<DeskContextT>({
  divisionName: '',
  deskNum: 0
});

export default function DeskRequired({ children }: { children: ReactElement }) {
  const { id: officeId } = useOffice();
  const { user } = useAuth()!;
  const [loading, setLoading] = useState<boolean>(true);
  const [desk, setDesk] = useState<DeskContextT | null>(null);
  const { deskId } = useParams();

  const getDeskInfoFromDeskIdParam = () => {
    const [divisionName, deskNum] = deskId!.split('-desk-');
    const parsedDivisionName = divisionName
      .split('-')
      .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' ');
    return { divisionName: parsedDivisionName, deskNum: parseInt(deskNum) };
  };

  const { divisionName, deskNum } = getDeskInfoFromDeskIdParam();

  useEffect(() => {
    const getUpFromDesk = async () => {
      // Get user up from desk
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${officeId}/users/${user.id}/desk`,
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
  }, [user.id, officeId]);

  useEffect(() => {
    const sitAtDesk = async () => {
      // Sit user at desk
      console.log(user);
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${officeId}/users/${user.id}/desk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            divisionName: divisionName,
            deskNumber: deskNum
          })
        }
      );

      const { error, data } = await res.json();

      if (error) {
        console.error(error);
      } else if (data) {
        console.log(data);
        setDesk({ divisionName: data.divisionName, deskNum: data.deskNumber });
        setLoading(false);
      }
    };

    sitAtDesk();
  }, [user, divisionName, deskNum, officeId]);

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
