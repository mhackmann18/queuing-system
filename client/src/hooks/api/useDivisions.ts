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

      if (response.status !== 200) {
        throw new Error('Could not load divisions');
      }

      const divisions = response.data;

      setDivisions(divisions);
    } catch (error) {
      setError(String(error));
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
