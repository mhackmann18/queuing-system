import { useContext } from 'react';
import { DeskContext } from 'components/ContextProviders/DeskContextProvider';

export default function useDesk() {
  return useContext(DeskContext);
}
