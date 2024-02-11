import { createContext } from 'react';

export interface ErrorContextT {
  error: string;
  setError: (error: string) => void;
}

export const ErrorContext = createContext<ErrorContextT>({
  error: '',
  setError: () => null
});
