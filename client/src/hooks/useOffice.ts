import { useContext } from 'react';
import { OfficeContext } from 'components/ContextProviders/OfficeContextProvider/context';

export default function useOffice() {
  const office = useContext(OfficeContext);

  if (!office) {
    throw new Error('OfficeContext is either not provided or is null.');
  }

  return office;
}
