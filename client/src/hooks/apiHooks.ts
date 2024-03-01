/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Enable eslint rule
import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL, DUMMY_OFFICE_ID } from 'utils/constants';
import Connector from 'utils/signalRConnection';
import useAuth from 'hooks/useAuth';
import useOffice from './useOffice';

export function useLoginUser() {
  const [loading, setLoading] = useState<boolean>(false);

  const loginUser = useCallback(
    async (userCredentials: {
      username: string;
      password: string;
    }): Promise<{ data: any | null; error?: string }> => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userCredentials)
        });

        const parsedResponse = await response.json();

        return parsedResponse;
      } catch (error) {
        return { data: null, error: String(error) };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loginUser, loading };
}

export function useFetchOffice() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const fetchOffice = useCallback(async (): Promise<{
    data: any | null;
    error?: string;
  }> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/offices/${DUMMY_OFFICE_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const parsedResponse = await response.json();

      return parsedResponse;
    } catch (error) {
      return { data: null, error: String(error) };
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { fetchOffice, loading };
}

interface Division {
  name: string;
  maxNumberOfDesks: number;
  occupiedDeskNums: number[];
}

// interface FetchDivisionsResponse {
//   divisions: Division[] | null;
//   error?: string;
// }
interface LeaveDeskResponse {
  desk: any | null;
  error?: string;
}

export function useLeaveDesk() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token, user } = useAuth();
  const { id: officeId } = useOffice();

  const leaveDesk = useCallback(async (): Promise<LeaveDeskResponse> => {
    setLoading(true);
    // Get user up from desk
    try {
      const res = await fetch(
        `http://localhost:5274/api/v1/offices/${officeId}/users/${user!.id}/desk`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { error, data } = await res.json();

      return {
        desk: data || null,
        error
      };
    } catch (error) {
      return {
        desk: null,
        error: String(error)
      };
    } finally {
      setLoading(false);
    }
  }, [user, officeId, token]);

  return { leaveDesk, loading };
}

export function useDivisions() {
  const [divisions, setDivisions] = useState<Division[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { token } = useAuth();
  const { events } = Connector();

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/offices/${DUMMY_OFFICE_ID}/divisions`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { data, error } = await response.json();

      if (data) {
        setDivisions(data);
      } else {
        setError(error);
      }
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Fetch divisions on component mount
    fetchDivisions();

    // Fetch divisions on desks updated
    events({ onDesksUpdated: fetchDivisions });
  }, [events, fetchDivisions]);

  return { divisions, loading, error };
}

export function useDeleteCustomer() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const { id: officeId } = useOffice();

  const deleteCustomer = useCallback(
    async (customerId: string): Promise<{ data: any | null; error?: string }> => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/offices/${officeId}/customers/${customerId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        const parsedResponse = await response.json();

        return parsedResponse;
      } catch (error) {
        return { data: null, error: String(error) };
      } finally {
        setLoading(false);
      }
    },
    [officeId, token]
  );

  return { deleteCustomer, loading };
}

export function useCheckInCustomer() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const { id: officeId } = useOffice();

  const checkInCustomer = useCallback(
    async (checkInData: {
      fullName: string;
      divisionNames: string[];
    }): Promise<{ data: any | null; error?: string }> => {
      setLoading(true);
      try {
        console.log('checkInData', checkInData);
        const response = await fetch(
          `${API_BASE_URL}/offices/${officeId}/customers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(checkInData)
          }
        );

        const parsedResponse = await response.json();

        return parsedResponse;
      } catch (error) {
        return { data: null, error: String(error) };
      } finally {
        setLoading(false);
      }
    },
    [officeId, token]
  );

  return { checkInCustomer, loading };
}

export function usePatchCustomer() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const { id: officeId } = useOffice();

  const patchCustomer = useCallback(
    async (
      customerId: string,
      updateData: {
        divisions: { name: string; status: string; waitingListIndex?: number }[];
      }
    ): Promise<{ data: any | null; error?: string }> => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/offices/${officeId}/customers/${customerId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          }
        );

        const parsedResponse = await response.json();

        return parsedResponse;
      } catch (error) {
        return { data: null, error: String(error) };
      } finally {
        setLoading(false);
      }
    },
    [officeId, token]
  );

  return { patchCustomer, loading };
}
