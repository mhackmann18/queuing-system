import { useContext } from 'react';
import { OfficeContext } from 'components/ContextProviders/OfficeContextProvider';

export default function useOffice() {
  const office = useContext(OfficeContext);
  return office;
}
