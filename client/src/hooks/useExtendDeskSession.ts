import { useEffect, useRef, useContext, useState, useCallback } from 'react';
import api from 'utils/api';
import useAuth from './useAuth';
import useOffice from './useOffice';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider/context';
import { parseServerDateAsUtc } from 'utils/helpers';

const TIME_BEFORE_NEXT_EXTENSION_ALLOWED = 3000; // 3 seconds

export default function useExtendDeskSession() {
  const { id: officeId } = useOffice();
  const { user, token: authToken } = useAuth();
  const userId = user!.id;
  const { originalSessionEndTime } = useContext(DeskContext);
  const [sessionAboutToExpire, setSessionAboutToExpire] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(
    originalSessionEndTime
  );

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Exported function
  const extendSession = useCallback(async () => {
    const response = await api.extendUserDeskSession(officeId, userId, authToken);

    const { sessionEndTime } = await response.data;

    setSessionEndTime(parseServerDateAsUtc(sessionEndTime));
    setSessionAboutToExpire(false);
  }, [authToken, officeId, userId]);

  useEffect(() => {
    const extendSessionOnActivity = () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(async () => {
        try {
          await extendSession();
        } catch (error) {
          if (error instanceof Error) {
            console.log(error);
          }
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
  }, [extendSession]);

  useEffect(() => {
    const checkSessionEndTime = setInterval(() => {
      if (sessionEndTime) {
        // console.log(sessionEndTime);
        // console.log(new Date());
        const timeLeft = sessionEndTime.getTime() - new Date().getTime();
        if (timeLeft <= 60000) {
          // 60000 milliseconds = 1 minute
          setSessionAboutToExpire(true);
        } else {
          setSessionAboutToExpire(false);
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(checkSessionEndTime);
    };
  }, [sessionEndTime]);

  return { sessionAboutToExpire, extendSession };
}
