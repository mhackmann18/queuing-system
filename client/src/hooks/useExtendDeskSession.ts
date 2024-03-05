import { useEffect, useRef, useContext, useState } from 'react';
import api from 'utils/api';
import useAuth from './useAuth';
import useOffice from './useOffice';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';

const TIME_BEFORE_NEXT_EXTENSION_ALLOWED = 3000; // 3 seconds

export default function useExtendDeskSession({
  onNearExpiration = () => {}
}: {
  onNearExpiration?: () => void;
}) {
  const { id: officeId } = useOffice();
  const { user, token: authToken } = useAuth();
  const userId = user!.id;
  const { originalSessionEndTime } = useContext(DeskContext);

  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(
    originalSessionEndTime
  );

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const extendSessionOnActivity = () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(async () => {
        try {
          const response = await api.extendUserDeskSession(
            officeId,
            userId,
            authToken
          );

          if (!response.ok) {
            console.error('Error extending desk session', response);
          }

          const { sessionEndTime } = await response.json();

          setSessionEndTime(new Date(sessionEndTime));
        } catch (error) {
          console.error('Error extending desk session', error);
        }
      }, TIME_BEFORE_NEXT_EXTENSION_ALLOWED);
    };

    window.addEventListener('mousemove', extendSessionOnActivity);
    window.addEventListener('keydown', extendSessionOnActivity);
    window.addEventListener('click', extendSessionOnActivity);

    return () => {
      window.removeEventListener('mousemove', extendSessionOnActivity);
      window.removeEventListener('keydown', extendSessionOnActivity);
      window.removeEventListener('click', extendSessionOnActivity);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [authToken, officeId, userId]);

  useEffect(() => {
    const checkSessionEndTime = setInterval(() => {
      if (sessionEndTime) {
        // console.log(sessionEndTime);
        // console.log(new Date());
        const timeLeft = sessionEndTime.getTime() - new Date().getTime();
        if (timeLeft <= 60000) {
          // 60000 milliseconds = 1 minute
          onNearExpiration();
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(checkSessionEndTime);
    };
  }, [sessionEndTime, onNearExpiration]);
}
