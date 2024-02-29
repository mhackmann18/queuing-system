import {
  ReactElement,
  useEffect,
  useState,
  createContext,
  useCallback
} from 'react';
import useAuth from 'hooks/useAuth';
import useOffice from 'hooks/useOffice';
import Connector from 'utils/signalRConnection';

interface Desk {
  divisionName: string;
  number: number;
}

interface SitAtDeskResponse {
  data?: {
    // userId: string;
    // officeId: string;
    divisionName: string;
    number: number;
  };
  error?: string;
}

interface DeskContextT {
  desk: Desk | null;
  sitAtDesk: (desk: Desk) => Promise<SitAtDeskResponse>;
}

export const DeskContext = createContext<DeskContextT>({
  desk: null,
  sitAtDesk: async () => ({ error: 'DeskContext not yet initialized' })
});

export default function DeskContextProvider({
  children
}: {
  children: ReactElement;
}) {
  const { id: officeId } = useOffice();
  const { user, token: userToken } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [desk, setDesk] = useState<Desk | null>(null);
  const { events } = Connector();
  const userId = user!.id;

  useEffect(() => {
    events({
      onDesksUpdated: async () => {
        const res = await fetch(`http://localhost:5274/api/v1/users/self`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });

        const { error, data } = await res.json();

        if (error) {
          console.error(error);
        } else if (data) {
          const { desk } = data;

          if (!desk) {
            setDesk(null);
          } else {
            setDesk(desk);
          }
        }
      }
    });
  }, [events, userToken]);

  const sitAtDesk = useCallback(
    async ({ divisionName, number }: Desk): Promise<SitAtDeskResponse> => {
      // Sit user at desk
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${officeId}/users/${userId}/desk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            divisionName,
            number
          })
        }
      );

      const parsedRes = await res.json();

      if (parsedRes.data) {
        const { divisionName, number } = parsedRes.data;
        setDesk({ divisionName, number });
      }

      return parsedRes;
    },
    [officeId, userId]
  );

  useEffect(() => {
    const getDesk = async () => {
      const res = await fetch(`http://localhost:5274/api/v1/users/self`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      const { error, data } = await res.json();

      if (data) {
        const { desk } = data;
        if (desk) {
          setDesk(desk);
        } else {
          setDesk(null);
        }
      } else if (error) {
        setDesk(null);
        console.error(error);
      }

      setLoading(false);
    };

    getDesk();
  }, [userId, officeId, userToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(desk);

  return (
    <DeskContext.Provider value={{ desk, sitAtDesk }}>
      {children}
    </DeskContext.Provider>
  );
}
