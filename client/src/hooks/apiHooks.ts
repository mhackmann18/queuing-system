import { useCallback, useState } from 'react';
import useAuth from 'hooks/useAuth';
import useOffice from './useOffice';
import api from 'utils/api';
import { CustomerDto } from 'utils/types';

export function useLoginUser() {
  const [loading, setLoading] = useState<boolean>(false);

  const loginUser = useCallback(
    async (userCredentials: {
      username: string;
      password: string;
    }): Promise<{ data: object | null; error?: string }> => {
      setLoading(true);
      try {
        const response = await api.loginUser(userCredentials);

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

interface LeaveDeskResponse {
  desk: object | null;
  error?: string;
}

export function useLeaveDesk() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token, user } = useAuth();
  const userId = user!.id;
  const { id: officeId } = useOffice();

  const leaveDesk = useCallback(async (): Promise<LeaveDeskResponse> => {
    setLoading(true);
    // Get user up from desk
    try {
      const res = await api.deleteUserFromDesk(officeId, userId, token);

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
  }, [userId, officeId, token]);

  return { leaveDesk, loading };
}

export function useDeleteCustomer() {
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const { id: officeId } = useOffice();

  const deleteCustomer = useCallback(
    async (customerId: string): Promise<{ data: object | null; error?: string }> => {
      setLoading(true);
      try {
        const response = await api.deleteCustomer(officeId, customerId, token);

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
    }): Promise<{ customer?: CustomerDto; error?: string }> => {
      setLoading(true);
      try {
        const response = await api.postCustomer(officeId, checkInData, token);

        if (!response.ok) {
          throw new Error('Error checking in customer');
        }

        const customer = await response.json();

        return { customer };
      } catch (error) {
        return { error: String(error) };
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
    ): Promise<{ customer?: CustomerDto; error?: string }> => {
      setLoading(true);
      try {
        const response = await api.patchCustomer(
          officeId,
          customerId,
          updateData,
          token
        );

        if (!response.ok) {
          throw new Error('Error updating customer');
        }

        const customer = await response.json();

        return { customer };
      } catch (error) {
        return { error: String(error) };
      } finally {
        setLoading(false);
      }
    },
    [officeId, token]
  );

  return { patchCustomer, loading };
}
