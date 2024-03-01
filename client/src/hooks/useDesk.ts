import { useContext } from 'react';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider';

export default function useDesk() {
  const deskContext = useContext(DeskContext);

  return deskContext;
}
