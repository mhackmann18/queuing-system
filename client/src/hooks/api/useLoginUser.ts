/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Enable eslint rule
import { useState } from 'react';
import { API_BASE_URL } from 'utils/constants';

export function useLoginUser() {
  const [loading, setLoading] = useState<boolean>(false);

  const loginUser = async (userCredentials: {
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
  };

  return { loginUser, loading };
}
