import { useState, ReactNode } from 'react';
import { ErrorContext } from './context';

interface ErrorContextProviderProps {
  children: ReactNode;
}

export default function ErrorContextProvider({
  children
}: ErrorContextProviderProps) {
  const [error, setError] = useState<string>('');

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
}
