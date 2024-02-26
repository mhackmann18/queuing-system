import { useContext } from 'react';
import { DeskContext } from 'components/DeskRequired';

export default function useDesk() {
  return useContext(DeskContext);
}
