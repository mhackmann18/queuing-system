import { useState, useEffect, useCallback } from 'react';
import Connector from 'utils/signalRConnection';
import useAuth from 'hooks/useAuth';
import { DivisionDto } from './types';
import useOffice from 'hooks/useOffice';
import api from 'utils/api';

export default function useDivisions() {
  const [divisions, setDivisions] = useState<DivisionDto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { id: officeId } = useOffice();
  const { token } = useAuth();
  const { events } = Connector();

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getOfficeDivisions(officeId, token);

      const divisions = response.data;

      setDivisions(divisions);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token, officeId]);

  useEffect(() => {
    // Fetch divisions on component mount
    fetchDivisions();

    // Fetch divisions when desks are updated
    events({ onDesksUpdated: fetchDivisions });
  }, [events, fetchDivisions]);

  return { divisions, loading, error };
}
