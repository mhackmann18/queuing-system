import { ReactElement, useEffect, useState, useCallback } from 'react';
import useAuth from 'hooks/useAuth';
import useOffice from 'hooks/useOffice';
import Connector from 'utils/signalRConnection';
import api from 'utils/api';
import { DeskContext } from './context';
import { Desk } from './context';
import { parseServerDateAsUtc } from 'utils/helpers';
import ErrorView from 'components/ErrorView';

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

        if (res.status !== 200) {
          console.error('Could not get user from auth token');
          return;
        }

        const { desk } = res.data;

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
    });
  }, [events, userToken]);

  const sitAtDesk = useCallback(
    async (desk: Desk): Promise<Desk> => {
      // Sit user at desk
      const response = await api.postUserToDesk(officeId, userId, desk, userToken);

      const { divisionName, number, sessionEndTime } = response.data;

      setOriginalSessionEndTime(parseServerDateAsUtc(sessionEndTime));

      setDesk({
        divisionName,
        number
      });

      return { divisionName, number };
    },
    [officeId, userId, userToken]
  );

  const leaveDesk = useCallback(async (): Promise<void> => {
    // Get user up from desk
    await api.deleteUserFromDesk(officeId, userId, userToken);

    setDesk(null);
  }, [userId, officeId, userToken]);

  // Get user's desk on component mount
  useEffect(() => {
    const getDesk = async () => {
      const res = await api.getUserFromAuthToken(userToken);

      if (res.status !== 200) {
        setError('Could not get user from auth token');
        return;
      }

      const { desk } = res.data;
      if (desk) {
        const { divisionName, number } = desk;
        setDesk({
          divisionName,
          number
        });
      } else {
        setDesk(null);
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
    return <ErrorView error={error} />;
  }

  return (
    <DeskContext.Provider
      value={{ desk, sitAtDesk, leaveDesk, originalSessionEndTime }}
    >
      {children}
    </DeskContext.Provider>
  );
}
