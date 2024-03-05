import { ReactElement, useEffect, useState, useCallback } from 'react';
import useAuth from 'hooks/useAuth';
import useOffice from 'hooks/useOffice';
import Connector from 'utils/signalRConnection';
import api from 'utils/api';
import { DeskContext } from './context';
import { Desk } from './context';

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
  const [originalSessionEndTime, setOriginalSessionEndTime] = useState<Date | null>(
    null
  );
  const { events } = Connector();
  const userId = user!.id;

  useEffect(() => {
    events({
      onDesksUpdated: async () => {
        const res = await api.getUserFromAuthToken(userToken);

        const { error, data } = await res.json();

        if (error) {
          console.error(error);
        } else if (data) {
          const { desk } = data;

          if (!desk) {
            setDesk(null);
          } else {
            const { divisionName, number } = desk;
            setDesk({
              divisionName,
              number
            });
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

        const { divisionName, number, sessionEndTime } = deskResponse;

        setOriginalSessionEndTime(new Date(sessionEndTime));

        console.log(sessionEndTime);
        console.log(new Date(sessionEndTime));

        setDesk({
          divisionName,
          number
        });
      } catch (error) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    },
    [officeId, userId, userToken]
  );

  const leaveDesk = useCallback(async (): Promise<void> => {
    setLoading(true);
    // Get user up from desk
    try {
      const response = await api.deleteUserFromDesk(officeId, userId, userToken);

      if (!response.ok) {
        throw new Error('Could not leave desk');
      }

      setDesk(null);
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  }, [userId, officeId, userToken]);

  useEffect(() => {
    const getDesk = async () => {
      const res = await api.getUserFromAuthToken(userToken);

      const { error, data } = await res.json();

      if (data) {
        const { desk } = data;
        if (desk) {
          const { divisionName, number } = desk;
          setDesk({
            divisionName,
            number
          });
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
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Loading desk context...
      </div>
    );
  }

  if (error) {
    console.error(error);
    return <p>There was a problem loading the desk context</p>;
  }

  return (
    <DeskContext.Provider
      value={{ desk, sitAtDesk, leaveDesk, originalSessionEndTime }}
    >
      {children}
    </DeskContext.Provider>
  );
}
