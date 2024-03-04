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
import api from 'utils/api';

interface Desk {
  divisionName: string;
  number: number;
}

interface DeskContextT {
  desk: Desk | null;
  sitAtDesk: (desk: Desk) => Promise<void>;
}

export const DeskContext = createContext<DeskContextT>({
  desk: null,
  sitAtDesk: async () => {
    throw new Error('DeskContext is not provided.');
  }
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
  const [error, setError] = useState<string>('');
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
    async (desk: Desk): Promise<void> => {
      setLoading(true);
      try {
        // Sit user at desk
        const response = await api.postUserToDesk(officeId, userId, desk, userToken);

        if (!response.ok) {
          throw new Error('Could not sit at desk');
        }

        const deskResponse = await response.json();

        const { divisionName, number } = deskResponse;

        setDesk({ divisionName, number });
      } catch (error) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    },
    [officeId, userId, userToken]
  );

  useEffect(() => {
    const getDesk = async () => {
      const res = await api.getAuthenticatedUser(userToken);

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
    return <p>Loading desk...</p>;
  }

  if (error) {
    return <p>There was a problem loading the available desks</p>;
  }

  return (
    <DeskContext.Provider value={{ desk, sitAtDesk }}>
      {children}
    </DeskContext.Provider>
  );
}
